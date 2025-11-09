import {z} from 'genkit';

export const GenerateEmailInputSchema = z.object({
  prompt: z.string().describe('The user\'s goal for the email. For example: "Send a follow-up to a potential client after a great meeting."'),
  tone: z.enum(['formal', 'friendly', 'marketing']).describe('The desired tone of the email.'),
});
export type GenerateEmailInput = z.infer<typeof GenerateEmailInputSchema>;

export const GenerateEmailOutputSchema = z.object({
  subject: z.string().describe('A concise and effective subject line for the email.'),
  body: z.string().describe('The full body content of the email, formatted professionally.'),
});
export type GenerateEmailOutput = z.infer<typeof GenerateEmailOutputSchema>;
