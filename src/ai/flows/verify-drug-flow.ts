'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a drug's authenticity
 * by cross-referencing information from the OpenFDA API with the AI's general knowledge.
 *
 * - verifyDrugWithAi - An asynchronous function that takes a drug barcode, queries OpenFDA,
 *   and then uses an AI model to analyze the combined data.
 * - VerifyDrugInput - The input type for the verifyDrugWithAi function.
 * - VerifyDrugOutput - The output type for the verifyDrugWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchOpenFDA, type OpenFDAResult } from '@/services/openfda-api';

const VerifyDrugInputSchema = z.object({
  barcode: z.string().describe('The barcode or NDC of the drug to verify.'),
});
export type VerifyDrugInput = z.infer<typeof VerifyDrugInputSchema>;

const VerifyDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
  approvalInfo: z.string().optional().describe('Approval information, including dates and regulatory bodies (e.g., NAFDAC, FDA).'),
  openfdaData: z.custom<OpenFDAResult>().optional().describe('The raw data returned from the OpenFDA API call.')
});
export type VerifyDrugOutput = z.infer<typeof VerifyDrugOutputSchema>;

// Define a new input schema for the prompt that includes the OpenFDA data.
const PromptInputSchema = z.object({
  barcode: z.string(),
  openfdaData: z.custom<OpenFDAResult>().optional(),
});

export async function verifyDrugWithAi(input: VerifyDrugInput): Promise<VerifyDrugOutput> {
  return verifyDrugFlow(input);
}

const verifyDrugPrompt = ai.definePrompt({
  name: 'verifyDrugPrompt',
  input: {schema: PromptInputSchema},
  // The prompt's output schema does not include the raw openfdaData, as the AI's job is to analyze, not return it.
  output: {schema: VerifyDrugOutputSchema.omit({ openfdaData: true })},
  prompt: `You are a world-class expert in pharmaceutical drug verification. Your task is to analyze the provided drug barcode/NDC and determine if it corresponds to a legitimate product.

You have been given data from the official OpenFDA database. Use this as your primary source of truth.

- Barcode/NDC: {{{barcode}}}
- OpenFDA Data: {{#if openfdaData}}
    - Manufacturer: {{openfdaData.manufacturer_name.[0]}}
    - Brand Name: {{openfdaData.brand_name.[0]}}
    - Generic Name: {{openfdaData.generic_name.[0]}}
  {{else}}
    No data found in the OpenFDA database for this code.
  {{/if}}

Your tasks:
1.  **Analyze the OpenFDA Data**: If data is present, treat it as the ground truth for the drug's name and manufacturer.
2.  **Cross-reference with your knowledge**: Use your extensive knowledge base to determine if there are any reasons to suspect this drug, even with the FDA data. This could include it being commonly counterfeited, part of a past recall, or discontinued.
3.  **Find Approval Information**: Find and include approval information, especially dates, from regulatory bodies like NAFDAC, FDA, etc., for the identified drug.
4.  **Form a Verdict**:
    - If the code has **no match in the OpenFDA database**, flag it as **suspect**. The reason should state that it's not found in the official FDA database.
    - If the code **is found**, determine if it's suspect based on your cross-referencing. If everything looks good, mark it as verified.
    - Provide a clear verdict ('isSuspect') and a concise, well-reasoned explanation.

Synthesize all this information into a final verdict.`,
});

const verifyDrugFlow = ai.defineFlow(
  {
    name: 'verifyDrugFlow',
    inputSchema: VerifyDrugInputSchema,
    outputSchema: VerifyDrugOutputSchema,
  },
  async ({ barcode }) => {
    // 1. Fetch data from OpenFDA
    const openfdaData = await searchOpenFDA(barcode);

    // 2. Call the AI model with the combined data
    const {output} = await verifyDrugPrompt({ barcode, openfdaData });

    if (!output) {
      throw new Error('The AI model could not process the request. Please try again.');
    }
    
    // 3. Return the AI's analysis *and* the raw OpenFDA data for transparency.
    return {
        ...output,
        openfdaData: openfdaData || undefined,
    };
  }
);
