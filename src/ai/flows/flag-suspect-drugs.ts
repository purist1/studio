'use server';
/**
 * @fileOverview This file defines a Genkit flow for flagging potentially counterfeit drugs using general AI knowledge.
 *
 * - flagSuspectDrug - An asynchronous function that takes a drug barcode and returns a verdict on whether the drug is suspect.
 * - FlagSuspectDrugInput - The input type for the flagSuspectDrug function.
 * - FlagSuspectDrugOutput - The output type for the flagSuspectDrug function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagSuspectDrugInputSchema = z.object({
  barcode: z.string().describe('The barcode or NDC of the drug to verify.'),
});
export type FlagSuspectDrugInput = z.infer<typeof FlagSuspectDrugInputSchema>;

const FlagSuspectDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
});
export type FlagSuspectDrugOutput = z.infer<typeof FlagSuspectDrugOutputSchema>;

export async function flagSuspectDrug(input: FlagSuspectDrugInput): Promise<FlagSuspectDrugOutput> {
  return flagSuspectDrugFlow(input);
}

const flagSuspectDrugPrompt = ai.definePrompt({
  name: 'flagSuspectDrugPrompt',
  input: {schema: FlagSuspectDrugInputSchema},
  output: {schema: FlagSuspectDrugOutputSchema},
  prompt: `You are a world-class expert in pharmaceutical drug verification. Your task is to analyze the provided drug barcode/NDC and determine if it corresponds to a legitimate product.

Use your extensive knowledge base to:
1.  Identify the drug name and manufacturer associated with this code: {{{barcode}}}.
2.  Determine if there are any reasons to suspect this drug. This could include: it being commonly counterfeited, part of a past recall, discontinued, or if the code doesn't correspond to any known drug.
3.  Provide a clear verdict ('isSuspect') and a concise, well-reasoned explanation.

If you identify the drug, state its name and manufacturer clearly in your reason. If you cannot identify the drug, state that the code does not match any known products in your database and flag it as suspect.`,
});

const flagSuspectDrugFlow = ai.defineFlow(
  {
    name: 'flagSuspectDrugFlow',
    inputSchema: FlagSuspectDrugInputSchema,
    outputSchema: FlagSuspectDrugOutputSchema,
  },
  async input => {
    const {output} = await flagSuspectDrugPrompt(input);
    if (!output) {
      return {
        isSuspect: true,
        reason: 'The AI model could not process the request. Please try again.',
      };
    }
    return output;
  }
);
