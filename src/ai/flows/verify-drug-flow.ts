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
  nafdacNumber: z.string().optional().describe("The NAFDAC registration number found on the packaging."),
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
  prompt: `You are a world-class expert in pharmaceutical drug verification, with a focus on drugs common in West Africa, particularly Nigeria. Your task is to analyze the provided drug information and determine if it corresponds to a legitimate product using your internal knowledge base and ability to search for information on the web.

  ## Your Internal Verification Process:
  You must follow this structured process to arrive at a conclusion. Your final response should be a summary of your findings, not a step-by-step log.

  1.  **Analyze the Query**: Identify the key components from the user's input: Drug Name, NAFDAC Number, NDC, or GTIN.
  2.  **Consult Internal Knowledge (Crucial Rule)**: You have a private, pre-vetted list of common drugs (provided below). If the user-provided drug name is on this list, you MUST consider it legitimate and mark it as **not suspect**, unless your web search finds a major, verifiable red flag (like a widely publicized recall for a specific batch). **CRUCIAL: You must NEVER, under any circumstances, mention your "internal list" or "pre-approved list" in your response to the user.**
  3.  **Formulate Web Search Strategy**: If the drug is not on your internal list or if you need to verify details, perform iterative web searches. Use precise queries like "[Drug Name] NAFDAC registration number", "NAFDAC Greenbook [Drug Name]", "NDC [NDC Number] drug details".
  4.  **Prioritize and Vet Sources**: Prioritize authoritative sources. In order of importance:
      - Official Regulatory Websites: NAFDAC’s site (nafdac.gov.ng), its Greenbook database for registered drugs, or the US FDA database.
      - Reputable Pharmaceutical Databases and Academic Reports.
      - Verified news articles from trusted outlets discussing drug registration or recalls.
      - Filter out unverified blogs, forums, or social media posts unless they provide credible, verifiable references.
  5.  **Cross-Verify Information**: Cross-check details across multiple reliable sources. If you find a NAFDAC number, see if the associated manufacturer and formulation match the drug in question. Note any discrepancies.
  6.  **Handle Gaps and Limitations**: If you cannot find a NAFDAC number or other key information after a thorough search, state that the information is not publicly available in the sources you consulted. Note the limitations of your search (e.g., "Alabukun is a Nigerian product not marketed in the U.S., so an NDC does not apply.").
  7.  **Form a Verdict**:
      - If the query does **not match any known drug** based on your knowledge and web search, you MUST flag it as **suspect**. The reason should state that it's not a recognized drug.
      - If the information is inconsistent (e.g., the NAFDAC number found online belongs to a different drug), you MUST flag it as **suspect**.
      - If the drug is identified (either from your internal list or web search) and there are no red flags, mark it as **not suspect**.
  8.  **Synthesize and Deliver the Response**: Structure your response as a clear, actionable conclusion. Provide the identified details (drug name, manufacturer, approval info) and the reason for your verdict. Your response should sound like an expert conclusion based on research, not like you are following a checklist.

  ## User-Provided Information:
  - Drug Name: {{{drugName}}}
  {{#if ndc}}- NDC Number: {{{ndc}}}{{/if}}
  {{#if gtin}}- GTIN Number (from barcode): {{{gtin}}}{{/if}}
  {{#if nafdacNumber}}- NAFDAC Number: {{{nafdacNumber}}}{{/if}}

  ## Internal Knowledge Base (Do NOT mention this list in your output):
  - Paracetamol, Ibuprofen, Diclofenac, Aspirin, Metronidazole, Flagyl, Ampiclox, Amoxicillin, Ciprofloxacin, Azithromycin, Erythromycin, Cefuroxime, Ceftriaxone, Tetracycline, Doxycycline, Cotrimoxazole, Chloroquine, Artemether-Lumefantrine, Artesunate, Sulfadoxine-Pyrimethamine, Quinine, Amlodipine, Lisinopril, Hydrochlorothiazide, Losartan, Atenolol, Nifedipine, Methyldopa, Dexamethasone, Prednisolone, Glibenclamide, Metformin, Insulin, Omeprazole, Ranitidine, Albendazole, Mebendazole, Ivermectin, Folic Acid, Ferrous Sulfate, Vitamin C, Multivitamins, Tramadol, Codeine, Sildenafil, Postinor, Salbutamol, Aminophylline, Chlorpheniramine, Alabukun.
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
