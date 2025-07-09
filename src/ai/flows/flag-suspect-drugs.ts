'use server';
/**
 * @fileOverview This file defines a Genkit flow for flagging potentially counterfeit drugs.
 *
 * - flagSuspectDrug - An asynchronous function that takes drug data as input and returns a verdict on whether the drug is suspect.
 * - FlagSuspectDrugInput - The input type for the flagSuspectDrug function, representing drug data.
 * - FlagSuspectDrugOutput - The output type for the flagSuspectDrug function, indicating whether the drug is suspect and providing a reason.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagSuspectDrugInputSchema = z.object({
  manufacturer: z.string().describe('The name of the drug manufacturer.'),
  productionDate: z.string().describe('The production date of the drug.'),
  batchNumber: z.string().describe('The batch number of the drug.'),
  openFDADetails: z.string().optional().describe('Details from OpenFDA, if available.'),
  gs1Details: z.string().optional().describe('Details from GS1, if available.'),
  internalDatasetDetails: z.string().optional().describe('Details from internal dataset, if available.'),
});
export type FlagSuspectDrugInput = z.infer<typeof FlagSuspectDrugInputSchema>;

const FlagSuspectDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit.'),
  reason: z.string().describe('The reason for suspecting the drug is counterfeit.'),
});
export type FlagSuspectDrugOutput = z.infer<typeof FlagSuspectDrugOutputSchema>;

export async function flagSuspectDrug(input: FlagSuspectDrugInput): Promise<FlagSuspectDrugOutput> {
  return flagSuspectDrugFlow(input);
}

const flagSuspectDrugPrompt = ai.definePrompt({
  name: 'flagSuspectDrugPrompt',
  input: {schema: FlagSuspectDrugInputSchema},
  output: {schema: FlagSuspectDrugOutputSchema},
  prompt: `You are an AI assistant designed to identify potentially counterfeit drugs.  Analyze the provided drug data, including manufacturer, production date, batch number, and information from OpenFDA, GS1, and internal datasets to determine if the drug is suspect. Cross-reference the attributes to find inconsistencies that may indicate a fake medication. Return whether the drug is suspect, and the reason why. Focus on inconsistencies between the different data sources to determine if the drug is suspect.

Manufacturer: {{{manufacturer}}}
Production Date: {{{productionDate}}}
Batch Number: {{{batchNumber}}}
OpenFDA Details: {{{openFDADetails}}}
GS1 Details: {{{gs1Details}}}
Internal Dataset Details: {{{internalDatasetDetails}}}

Is the drug suspect? Provide the reasoning.`,
});

const flagSuspectDrugFlow = ai.defineFlow(
  {
    name: 'flagSuspectDrugFlow',
    inputSchema: FlagSuspectDrugInputSchema,
    outputSchema: FlagSuspectDrugOutputSchema,
  },
  async input => {
    const {output} = await flagSuspectDrugPrompt(input);
    return output!;
  }
);
