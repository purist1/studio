'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a drug's authenticity using only the AI's general knowledge.
 *
 * - verifyDrugWithAi - An asynchronous function that takes a drug barcode and returns a verdict on whether the drug is suspect.
 * - VerifyDrugInput - The input type for the verifyDrugWithAi function.
 * - VerifyDrugOutput - The output type for the verifyDrugWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyDrugInputSchema = z.object({
  barcode: z.string().describe('The barcode or NDC of the drug to verify.'),
});
export type VerifyDrugInput = z.infer<typeof VerifyDrugInputSchema>;

const VerifyDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
  approvalInfo: z.string().optional().describe('Approval information, including dates and regulatory bodies (e.g., NAFDAC, FDA).')
});
export type VerifyDrugOutput = z.infer<typeof VerifyDrugOutputSchema>;

export async function verifyDrugWithAi(input: VerifyDrugInput): Promise<VerifyDrugOutput> {
  return verifyDrugFlow(input);
}

const verifyDrugPrompt = ai.definePrompt({
  name: 'verifyDrugPrompt',
  input: {schema: VerifyDrugInputSchema},
  output: {schema: VerifyDrugOutputSchema},
  prompt: `You are a world-class expert in pharmaceutical drug verification. Your task is to analyze the provided drug barcode/NDC and determine if it corresponds to a legitimate product.

Use your extensive knowledge base to:
1.  Identify the drug name and manufacturer associated with this code: {{{barcode}}}.
2.  Find and include approval information, especially dates, from regulatory bodies like NAFDAC, FDA, etc. for the identified drug.
3.  Determine if there are any reasons to suspect this drug. This could include: it being commonly counterfeited, part of a past recall, discontinued, or if the code doesn't correspond to any known drug.
4.  Provide a clear verdict ('isSuspect') and a concise, well-reasoned explanation.

If you identify the drug, state its name and manufacturer clearly in your reason. If you cannot identify the drug, state that the code does not match any known products in your database and flag it as suspect.`,
});

const verifyDrugFlow = ai.defineFlow(
  {
    name: 'verifyDrugFlow',
    inputSchema: VerifyDrugInputSchema,
    outputSchema: VerifyDrugOutputSchema,
  },
  async input => {
    const {output} = await verifyDrugPrompt(input);
    if (!output) {
      throw new Error('The AI model could not process the request. Please try again.');
    }
    return output;
  }
);
