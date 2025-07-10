'use server';
/**
 * @fileOverview This file defines a Genkit flow for a conversational AI about drug validity.
 *
 * - chatWithAi - An asynchronous function that takes a user's message and the chat history.
 * - ChatWithAiInput - The input type for the chatWithAi function.
 * - ChatWithAiOutput - The output type for the chatWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getDrugDetailsFromAPI} from '@/services/drug-api';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatWithAiInputSchema = z.object({
  history: z.array(MessageSchema).describe('The chat history.'),
  message: z.string().describe('The user\'s message.'),
});
export type ChatWithAiInput = z.infer<typeof ChatWithAiInputSchema>;

const ChatWithAiOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type ChatWithAiOutput = z.infer<typeof ChatWithAiOutputSchema>;

// Tool to get drug details
const getDrugInfoTool = ai.defineTool(
    {
        name: 'getDrugInfo',
        description: 'Get information about a drug from its barcode or NDC number to check its validity. Use this if the user provides a number or asks to check a specific drug.',
        inputSchema: z.object({
            barcode: z.string().describe("The barcode or NDC number of the drug."),
        }),
        outputSchema: z.any(),
    },
    async (input) => getDrugDetailsFromAPI(input.barcode)
);

export async function chatWithAi(input: ChatWithAiInput): Promise<ChatWithAiOutput> {
  return chatWithAiFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatWithAiPrompt',
  input: {schema: ChatWithAiInputSchema},
  output: {schema: ChatWithAiOutputSchema},
  tools: [getDrugInfoTool],
  prompt: `You are an expert AI assistant for CUSTECH DrugVerify. Your role is to help clinic staff verify drug authenticity and answer questions about counterfeit drugs. Be helpful, concise, and professional.

    - If a user provides a barcode/NDC, use the 'getDrugInfo' tool to fetch details.
    - Based on the tool's output, analyze the data (OpenFDA, DailyMed, Internal Dataset) to determine if the drug is suspect.
    - Explain your reasoning clearly. If a drug is discontinued (has a MarketingEndDate), state that clearly as a high-risk factor.
    - If you don't have enough information, say so. Do not invent details.
    - If the user asks a general question, answer it based on your knowledge of drug verification.

    Chat History:
    {{#each history}}
    {{role}}: {{content}}
    {{/each}}
    
    User Question: {{{message}}}
  `,
});

const chatWithAiFlow = ai.defineFlow(
  {
    name: 'chatWithAiFlow',
    inputSchema: ChatWithAiInputSchema,
    outputSchema: ChatWithAiOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
    const response = llmResponse.output?.response || "Sorry, I couldn't process that request.";
    return { response };
  }
);
