'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a drug's authenticity
 * by relying on the AI model's general knowledge and web search capabilities.
 *
 * - verifyDrugWithAi - An asynchronous function that takes a drug query and uses
 *   an AI model to get a verification.
 * - VerifyDrugInput - The input type for the verifyDrugWithAi function.
 * - VerifyDrugOutput - The output type for the verifyDrugWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const VerifyDrugInputSchema = z.object({
  drugName: z.string().optional().describe("The name of the drug as it appears on the packaging."),
  ndc: z.string().optional().describe("The National Drug Code (NDC) found on the packaging."),
  gtin: z.string().optional().describe("The Global Trade Item Number (GTIN) from the barcode."),
});
export type VerifyDrugInput = z.infer<typeof VerifyDrugInputSchema>;

const VerifyDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
  approvalInfo: z.string().optional().describe('Approval information, including dates and regulatory bodies (e.g., NAFDAC, FDA).'),
});
export type VerifyDrugOutput = z.infer<typeof VerifyDrugOutputSchema>;

export async function verifyDrugWithAi(input: VerifyDrugInput): Promise<VerifyDrugOutput> {
  return verifyDrugFlow(input);
}

const verificationPrompt = ai.definePrompt({
  name: 'verifyDrugPrompt',
  input: {schema: VerifyDrugInputSchema},
  output: {schema: VerifyDrugOutputSchema},
  prompt: `You are a world-class expert in pharmaceutical drug verification. Your task is to analyze the provided drug information and determine if it corresponds to a legitimate product using your internal knowledge base and ability to search for information.

  ## User-Provided Information:
  - Drug Name: {{{drugName}}}
  - NDC / Barcode: {{{ndc}}}{{{gtin}}}

  ## Your Task:
  1.  **Identify the Drug**: Based on the provided information, identify the drug's common name and manufacturer.
  2.  **Cross-reference and Verify**: Use your extensive knowledge to determine if there are any reasons to suspect this drug. Check for inconsistencies between the provided name and codes. Look for information on recalls, common counterfeiting reports, or if the query details do not correspond to any known drug.
  3.  **Find Approval Information**: Search for and include approval information from major regulatory bodies like Nigeria's NAFDAC, the US FDA, or the European EMA.
  4.  **Form a Verdict**:
      - If the query does **not match any known drug**, you MUST flag it as **suspect**. The reason should state that it's not a recognized drug.
      - If the information is inconsistent (e.g., the NDC belongs to a different drug than the name provided), you MUST flag it as **suspect**.
      - If the drug is identified and there are no red flags, mark it as **not suspect**.
  5.  **Provide a Reason**: Write a clear, concise explanation for your verdict. Be specific about your findings.

  Synthesize all this information into a final verdict.
  `,
});

const verifyDrugFlow = ai.defineFlow(
  {
    name: 'verifyDrugFlow',
    inputSchema: VerifyDrugInputSchema,
    outputSchema: VerifyDrugOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await verificationPrompt(input);
      if (output) {
        return output;
      }
      throw new Error("The AI model returned an empty or invalid response.");
    } catch (e) {
      console.error("AI verification failed.", e);
      return {
        isSuspect: true,
        reason: "The AI model failed to process the request or returned an invalid response. Please try again or check the system status. This attempt has been logged.",
        drugName: input.drugName || "N/A",
        manufacturer: "N/A",
        approvalInfo: "N/A",
      };
    }
  }
);
