'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a drug's authenticity
 * by chaining multiple AI models for robustness.
 *
 * - verifyDrugWithAi - An asynchronous function that takes a drug query and tries
 *   a sequence of AI models (Gemini, OpenAI) to get a verification.
 * - VerifyDrugInput - The input type for the verifyDrugWithAi function.
 * - VerifyDrugOutput - The output type for the verifyDrugWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyDrugInputSchema = z.object({
  query: z.string().describe('The barcode, NDC, or name of the drug to verify.'),
});
export type VerifyDrugInput = z.infer<typeof VerifyDrugInputSchema>;

const VerifyDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
  approvalInfo: z.string().optional().describe('Approval information, including dates and regulatory bodies (e.g., NAFDAC, FDA).'),
  sourceModel: z.string().optional().describe('The AI model that provided the definitive answer.'),
});
export type VerifyDrugOutput = z.infer<typeof VerifyDrugOutputSchema>;

export async function verifyDrugWithAi(input: VerifyDrugInput): Promise<VerifyDrugOutput> {
  return verifyDrugFlow(input);
}

const basePrompt = `You are a world-class expert in pharmaceutical drug verification. Your task is to analyze the provided drug barcode, NDC, or name and determine if it corresponds to a legitimate product using your internal knowledge base.

- User Query: {{{query}}}

Your tasks:
1.  **Identify the Drug**: Based on the user's query, identify the drug's common name and manufacturer. If you cannot identify the drug, you MUST state that it was not identified.
2.  **Cross-reference with your knowledge**: Use your extensive knowledge base to determine if there are any reasons to suspect this drug. This could include it being commonly counterfeited, part of a past recall, discontinued, or if the query does not correspond to any known drug.
3.  **Find Approval Information**: Find and include approval information, especially dates, from regulatory bodies like NAFDAC, FDA, etc., for the identified drug.
4.  **Form a Verdict**:
    - If the query does **not match any known drug**, flag it as **suspect**. The reason should state that it's not a recognized drug.
    - If the drug **is identified**, determine if it's suspect based on your cross-referencing. If everything looks good, mark it as verified.
    - Provide a clear verdict ('isSuspect') and a concise, well-reasoned explanation.

Synthesize all this information into a final verdict.`;

const geminiPrompt = ai.definePrompt({
  name: 'verifyDrugGemini',
  input: {schema: VerifyDrugInputSchema},
  output: {schema: VerifyDrugOutputSchema},
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: basePrompt,
});

const openAiPrompt = ai.definePrompt({
  name: 'verifyDrugOpenAI',
  input: {schema: VerifyDrugInputSchema},
  output: {schema: VerifyDrugOutputSchema},
  model: 'openai/gpt-4o-mini',
  prompt: basePrompt,
});

const verifyDrugFlow = ai.defineFlow(
  {
    name: 'verifyDrugFlow',
    inputSchema: VerifyDrugInputSchema,
    outputSchema: VerifyDrugOutputSchema,
  },
  async ({ query }) => {
    // Chain of responsibility: Try Gemini -> OpenAI
    
    // 1. Try Gemini
    try {
      const {output} = await geminiPrompt({ query });
      if (output && output.drugName && output.drugName.toLowerCase() !== 'not identified') {
        return { ...output, sourceModel: 'Gemini 1.5 Pro' };
      }
    } catch (e) {
      console.error("Gemini verification failed, trying next model.", e);
    }
    
    // 2. Try OpenAI as the final fallback
    try {
      const {output} = await openAiPrompt({ query });
      if (output) {
         return { ...output, sourceModel: 'OpenAI GPT-4o Mini' };
      }
    } catch(e) {
         console.error("OpenAI verification failed.", e);
    }

    // If all models fail, return a generic error.
    throw new Error('All AI models failed to process the request. Please try again later.');
  }
);
