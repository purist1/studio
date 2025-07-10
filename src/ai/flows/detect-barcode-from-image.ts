'use server';
/**
 * @fileOverview A Genkit flow that uses Google Cloud Vision API to detect a barcode from an image.
 *
 * - detectBarcode - A function that takes an image data URI and returns the detected barcode.
 * - DetectBarcodeInput - The input type for the detectBarcode function.
 * - DetectBarcodeOutput - The return type for the detectBarcode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ImageAnnotatorClient } from '@google-cloud/vision';

const DetectBarcodeInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a barcode, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectBarcodeInput = z.infer<typeof DetectBarcodeInputSchema>;

const DetectBarcodeOutputSchema = z.object({
  barcode: z.string().optional().describe('The detected barcode value.'),
});
export type DetectBarcodeOutput = z.infer<typeof DetectBarcodeOutputSchema>;

export async function detectBarcode(input: DetectBarcodeInput): Promise<DetectBarcodeOutput> {
  return detectBarcodeFlow(input);
}

const detectBarcodeFlow = ai.defineFlow(
  {
    name: 'detectBarcodeFlow',
    inputSchema: DetectBarcodeInputSchema,
    outputSchema: DetectBarcodeOutputSchema,
  },
  async (input) => {
    const visionClient = new ImageAnnotatorClient();

    // The Vision API expects just the base64 content, so we remove the data URI prefix.
    const imageContent = input.imageDataUri.split(';base64,').pop();

    if (!imageContent) {
      throw new Error('Invalid image data URI format.');
    }

    const [result] = await visionClient.barcodeDetection({
        image: { content: imageContent },
    });
    
    const barcodes = result.barcodeAnnotations;
    if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return {
            barcode: barcodes[0].rawValue
        }
    }
    
    return {
        barcode: undefined
    };
  }
);
