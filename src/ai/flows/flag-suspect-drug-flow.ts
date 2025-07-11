
'use server';
/**
 * @fileOverview This file defines a Genkit flow for flagging a suspect drug by
 * comparing user-provided data with information from the OpenFDA database.
 *
 * - flagSuspectDrug - An asynchronous function that takes drug details and returns a suspicion verdict.
 * - FlagSuspectDrugInput - The input type for the flagSuspectDrug function.
 * - FlagSuspectDrugOutput - The output type for the flagSuspectDrug function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchOpenFDA } from '@/services/openfda-api';

const FlagSuspectDrugInputSchema = z.object({
  drugName: z.string().optional().describe("The name of the drug as it appears on the packaging."),
  ndc: z.string().optional().describe("The National Drug Code (NDC) found on the packaging."),
  gtin: z.string().optional().describe("The Global Trade Item Number (GTIN) from the barcode."),
});
export type FlagSuspectDrugInput = z.infer<typeof FlagSuspectDrugInputSchema>;

const FlagSuspectDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit or inconsistent.'),
  reason: z.string().describe('A detailed explanation for the verdict.'),
  drugName: z.string().optional().describe('The identified name of the drug from the database.'),
  manufacturer: z.string().optional().describe('The identified manufacturer from the database.'),
  apiData: z.any().optional().describe('The raw data returned from the OpenFDA API.'),
});
export type FlagSuspectDrugOutput = z.infer<typeof FlagSuspectDrugOutputSchema>;


export async function flagSuspectDrug(input: FlagSuspectDrugInput): Promise<FlagSuspectDrugOutput> {
  return flagSuspectDrugFlow(input);
}


const flaggingPrompt = ai.definePrompt({
  name: 'flagSuspectDrugPrompt',
  prompt: `You are a pharmaceutical verification specialist. Your task is to compare the drug information provided by a user with the official data retrieved from the OpenFDA database. Identify any inconsistencies that might suggest the drug is counterfeit.

  ## User-Provided Information:
  - Drug Name: {{{userInput.drugName}}}
  - NDC: {{{userInput.ndc}}}
  - GTIN: {{{userInput.gtin}}}

  ## Official Database Information (from OpenFDA):
  {{#if fdaData}}
  - Official Brand Name: {{{fdaData.brand_name.[0]}}}
  - Official Generic Name: {{{fdaData.generic_name.[0]}}}
  - Official Manufacturer: {{{fdaData.manufacturer_name.[0]}}}
  - Official NDC: {{{fdaData.product_ndc}}}
  {{else}}
  - No data found in the OpenFDA database for the provided NDC/GTIN.
  {{/if}}

  ## Your Task:
  1.  **Analyze Consistency**: Compare the user-provided data with the official database information. Note any mismatches in drug name, manufacturer, or codes.
  2.  **Handle Missing Data**: If no data was found in the OpenFDA database for the provided code, this is a major red flag.
  3.  **Form a Verdict**:
      - If no data was found in OpenFDA, you MUST flag the drug as **suspect**. The reason should state that it's not in the official US database.
      - If there are significant mismatches (e.g., the user-provided name is "Amoxicillin" but the database says the NDC belongs to "Aspirin"), you MUST flag it as **suspect**.
      - If the information is consistent, mark it as **not suspect**.
  4.  **Provide a Reason**: Write a clear, concise explanation for your verdict. Be specific about any inconsistencies you found.

  Synthesize this into a final verdict.
  `,
  output: {
    schema: FlagSuspectDrugOutputSchema
  },
});

const flagSuspectDrugFlow = ai.defineFlow(
  {
    name: 'flagSuspectDrugFlow',
    inputSchema: FlagSuspectDrugInputSchema,
    outputSchema: FlagSuspectDrugOutputSchema,
  },
  async (userInput) => {
    // Use the NDC if available, otherwise fall back to GTIN for the search.
    const barcodeToSearch = userInput.ndc || userInput.gtin;

    if (!barcodeToSearch) {
        return {
            isSuspect: true,
            reason: "No barcode (NDC or GTIN) was provided for database lookup. Verification is not possible without a unique identifier.",
            drugName: userInput.drugName || "Not Provided",
        };
    }

    const fdaData = await searchOpenFDA(barcodeToSearch);
    
    const { output } = await flaggingPrompt({ userInput, fdaData });
    
    if (!output) {
         return {
            isSuspect: true,
            reason: "The AI model failed to provide an analysis. This may be a temporary issue. The attempt has been logged.",
            drugName: userInput.drugName || "N/A",
            manufacturer: "N/A",
            apiData: fdaData,
        };
    }

    // Populate the response with data from the FDA lookup if available
    return {
      ...output,
      drugName: fdaData?.brand_name?.[0] || fdaData?.generic_name?.[0] || userInput.drugName || 'Not Identified',
      manufacturer: fdaData?.manufacturer_name?.[0] || 'Not Identified',
      apiData: fdaData,
    };
  }
);
