'use server';

/**
 * @fileOverview An AI financial analyst for providing profit-boosting suggestions.
 *
 * - getFinancialAdvice - A function that analyzes transactions and answers user queries.
 * - FinancialAnalystInput - The input type for the getFinancialAdvice function.
 * - FinancialAnalystOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAnalystInputSchema = z.object({
  transactions: z.array(z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number(),
    category: z.string(),
    currency: z.enum(['USD', 'INR']),
    date: z.string(),
  })).describe("An array of the user's financial transactions."),
  userQuery: z.string().optional().describe("A specific question from the user about their finances."),
});
export type FinancialAnalystInput = z.infer<typeof FinancialAnalystInputSchema>;

const FinancialAnalystOutputSchema = z.object({
  advice: z.string().describe("The AI's financial advice, formatted as a string. Use markdown for lists and bold text."),
});
export type FinancialAnalystOutput = z.infer<typeof FinancialAnalystOutputSchema>;

export async function getFinancialAdvice(input: FinancialAnalystInput): Promise<FinancialAnalystOutput> {
  return financialAnalystFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAnalystPrompt',
  input: {schema: FinancialAnalystInputSchema},
  output: {schema: FinancialAnalystOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to analyze the user's transaction data and provide actionable advice to increase profit.

  Transaction Data:
  {{#each transactions}}
  - {{type}} of {{amount}} {{currency}} in category '{{category}}' on {{date}}
  {{/each}}

  Based on this data, provide clear, concise, and actionable suggestions. Focus on identifying top expense categories, opportunities for revenue growth, and potential savings.

  {{#if userQuery}}
  The user has a specific question: "{{userQuery}}"
  Please answer this question first, then provide your general analysis and suggestions.
  {{else}}
  Please provide a general analysis and your top suggestions for improving profitability.
  {{/if}}

  Format your response using markdown for readability (e.g., bullet points, bold text).
  `,
});

const financialAnalystFlow = ai.defineFlow(
  {
    name: 'financialAnalystFlow',
    inputSchema: FinancialAnalystInputSchema,
    outputSchema: FinancialAnalystOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
