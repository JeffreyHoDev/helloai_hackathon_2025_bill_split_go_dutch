
'use server';
/**
 * @fileOverview A receipt analysis AI flow.
 *
 * - analyzeReceipt - A function that handles the receipt analysis process.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;

const AnalyzeReceiptOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the receipt (e.g., "Dinner at The Cafe", "Weekly Groceries").'),
  items: z.array(z.object({
    name: z.string().describe('The name of the item.'),
    price: z.number().describe('The price of the item as a number.'),
  })).describe('An array of items found on the receipt.'),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput> {
  return analyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: {schema: AnalyzeReceiptInputSchema},
  output: {schema: AnalyzeReceiptOutputSchema},
  prompt: `You are an expert receipt processor. Analyze the provided receipt image and extract the individual line items, including their names and prices. Also, provide a general title for the receipt based on the store or contents. Ignore taxes, totals, or any other summary lines. Focus only on the purchased items.

Use the following as the source of information about the receipt.

Receipt Image: {{media url=receiptDataUri}}`,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
