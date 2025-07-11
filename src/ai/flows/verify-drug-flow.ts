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
  prompt: `You are a world-class expert in pharmaceutical drug verification, with a focus on drugs common in West Africa, particularly Nigeria. Your task is to analyze the provided drug information and determine if it corresponds to a legitimate product using your internal knowledge base and ability to search for information.

  ## User-Provided Information:
  - Drug Name: {{{drugName}}}
  {{#if ndc}}- NDC Number: {{{ndc}}}{{/if}}
  {{#if gtin}}- GTIN Number (from barcode): {{{gtin}}}{{/if}}
  {{#if nafdacNumber}}- NAFDAC Number: {{{nafdacNumber}}}{{/if}}

  ## Common Nigerian & West African Drugs (Pre-approved List):
  - Paracetamol: Analgesic and antipyretic for pain and fever.
  - Ibuprofen: Nonsteroidal anti-inflammatory drug (NSAID) for pain and inflammation.
  - Diclofenac: NSAID for menstrual and body pain.
  - Aspirin: Analgesic and antiplatelet for pain and cardiovascular conditions.
  - Metronidazole: Antibacterial and antiprotozoal for infections like diarrhea.
  - Flagyl (Metronidazole brand): For abdominal pain and diarrhea.
  - Ampiclox (Ampicillin/Cloxacillin): Antibiotic for bacterial infections.
  - Amoxicillin: Broad-spectrum antibiotic for respiratory and other infections.
  - Ciprofloxacin: Antibiotic for bacterial infections like urinary tract infections.
  - Azithromycin: Antibiotic for respiratory and skin infections.
  - Erythromycin: Antibiotic for bacterial infections.
  - Cefuroxime: Cephalosporin antibiotic for various infections.
  - Ceftriaxone: Injectable antibiotic for severe infections.
  - Tetracycline: Antibiotic for acne and other infections.
  - Doxycycline: Antibiotic for malaria prophylaxis and bacterial infections.
  - Cotrimoxazole (Sulfamethoxazole/Trimethoprim): Antibiotic for infections like pneumonia.
  - Chloroquine: Antimalarial, though less common due to resistance.
  - Artemether-Lumefantrine: Antimalarial (ACT) for uncomplicated malaria.
  - Artesunate: Antimalarial for severe malaria.
  - Sulfadoxine-Pyrimethamine: Antimalarial for intermittent preventive treatment.
  - Quinine: Antimalarial for severe cases.
  - Amlodipine: Calcium channel blocker for hypertension.
  - Lisinopril: ACE inhibitor for hypertension and heart failure.
  - Hydrochlorothiazide: Diuretic for hypertension and edema.
  - Losartan: Angiotensin receptor blocker for hypertension.
  - Atenolol: Beta-blocker for hypertension and heart conditions.
  - Nifedipine: Calcium channel blocker for hypertension and angina.
  - Methyldopa: Antihypertensive, often used in pregnancy.
  - Dexamethasone: Corticosteroid for inflammation and allergies.
  - Prednisolone: Corticosteroid for autoimmune and inflammatory conditions.
  - Glibenclamide: Sulfonylurea for type 2 diabetes.
  - Metformin: Biguanide for type 2 diabetes.
  - Insulin (various forms): For type 1 and type 2 diabetes.
  - Omeprazole: Proton pump inhibitor for ulcers and GERD.
  - Ranitidine: H2 receptor blocker for ulcers and acid reflux.
  - Albendazole: Anthelmintic for worm infestations.
  - Mebendazole: Anthelmintic for parasitic infections.
  - Ivermectin: For parasitic infections like onchocerciasis.
  - Folic Acid: Supplement for anemia and pregnancy.
  - Ferrous Sulfate: Iron supplement for anemia.
  - Vitamin C: Supplement for immune support.
  - Multivitamins: General nutritional supplement.
  - Tramadol: Opioid analgesic for moderate to severe pain.
  - Codeine: Opioid for pain and cough suppression.
  - Sildenafil: For erectile dysfunction.
  - Postinor (Levonorgestrel): Emergency contraceptive.
  - Salbutamol: Bronchodilator for asthma.
  - Aminophylline: For asthma and chronic obstructive pulmonary disease.
  - Chlorpheniramine: Antihistamine for allergies.
  - Alabukun: Analgesic powder for pain and fatigue.

  ## Your Task:
  1.  **Check Pre-approved List**: If the user-provided drug name is on the pre-approved list above, you MUST consider it a legitimate drug and mark it as **not suspect**, unless there is a major, verifiable red flag like a widely publicized recall for a specific batch.
  2.  **Identify the Drug**: If not on the list, use the provided information to identify the drug's common name and manufacturer.
  3.  **Cross-reference and Verify**: Use your extensive knowledge to determine if there are any reasons to suspect this drug. Check for inconsistencies between the provided name and codes (NDC, GTIN, NAFDAC Number). Look for information on recalls, common counterfeiting reports, or if the query details do not correspond to any known drug.
  4.  **Find Approval Information**: Search for and include approval information from major regulatory bodies like Nigeria's NAFDAC, the US FDA, or the European EMA. The NAFDAC number is a critical piece of information for this.
  5.  **Form a Verdict**:
      - If the query does **not match any known drug** and is not on the pre-approved list, you MUST flag it as **suspect**. The reason should state that it's not a recognized drug.
      - If the information is inconsistent (e.g., the NAFDAC number belongs to a different drug than the name provided), you MUST flag it as **suspect**.
      - If the drug is identified and there are no red flags, or if it's on the pre-approved list, mark it as **not suspect**.
  6.  **Provide a Reason**: Write a clear, concise explanation for your verdict. Be specific about your findings.

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
