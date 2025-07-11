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
  message: z.string().describe("The user's message."),
});
export type ChatWithAiInput = z.infer<typeof ChatWithAiInputSchema>;

const ChatWithAiOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
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

    - If the user provides a specific barcode or NDC number, you MUST use the 'getDrugInfo' tool to fetch details from our trusted databases. This is the most reliable way to verify a drug.
    - If the tool returns drug information, analyze all the data sources (OpenFDA, DailyMed, Internal Dataset) to determine if the drug is suspect. Explain your reasoning clearly. If a drug is discontinued (has a MarketingEndDate in the past), state that clearly as a high-risk factor.
    - When the tool finds information, ALWAYS include the drug's name and manufacturer in your response.
    - For general questions about drug verification or counterfeit drugs (when no specific code is given), answer using your broad general knowledge.
    - If you don't have enough information from the tool or your knowledge, say so. Do not invent details.

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
    const response = llmResponse.output?.response;
    if (!response) {
      throw new Error("The AI model failed to generate a valid response.");
    }
    return { response };
  }
);
