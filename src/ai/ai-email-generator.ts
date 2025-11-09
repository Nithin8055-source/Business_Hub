'use server';

/**
 * @fileOverview AI-powered email generator.
 *
 * - generateEmail - A function that generates a professional email based on a user prompt and tone.
 */

import {ai} from '@/ai/genkit';
import { GenerateEmailInputSchema, GenerateEmailOutputSchema, type GenerateEmailInput, type GenerateEmailOutput } from '@/ai/schemas/email-generator';

const emailPrompt = ai.definePrompt({
  name: 'emailPrompt',
  input: {schema: GenerateEmailInputSchema},
  output: {schema: GenerateEmailOutputSchema},
  prompt: `You are an expert email copywriter. A user needs to write an email.
Their goal is: {{{prompt}}}
The desired tone is: {{{tone}}}

Please generate a professional and effective email, including a subject line and a full body.
The body should be ready to send, but use placeholders like [Your Name] or [Company Name] where appropriate.
`,
});

const generateEmailFlow = ai.defineFlow(
  {
    name: 'generateEmailFlow',
    inputSchema: GenerateEmailInputSchema,
    outputSchema: GenerateEmailOutputSchema,
  },
  async (input) => {
    const {output} = await emailPrompt(input);
    return output!;
  }
);

export async function generateEmail(input: GenerateEmailInput): Promise<GenerateEmailOutput> {
    return generateEmailFlow(input);
}
