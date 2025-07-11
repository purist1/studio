'use server';
/**
 * @fileOverview This file defines a Genkit flow for a general-purpose conversational AI.
 *
 * - chatWithAi - An asynchronous function that takes a user's message and the chat history.
 * - ChatWithAiInput - The input type for the chatWithAi function.
 * - ChatWithAiOutput - The return type for the chatWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function chatWithAi(input: ChatWithAiInput): Promise<ChatWithAiOutput> {
  return chatWithAiFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatWithAiPrompt',
  input: {schema: ChatWithAiInputSchema},
  output: {schema: ChatWithAiOutputSchema},
  prompt: `You are a helpful AI assistant for CUSTECH DrugVerify. Your role is to answer general questions about drug verification, counterfeit drugs, and pharmaceutical safety. Be helpful, concise, and professional. Do not attempt to verify specific drug codes yourself; guide the user to the "Verify Drug" feature for that purpose.

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
