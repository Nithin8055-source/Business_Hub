
'use server';

/**
 * @fileOverview AI-powered startup idea workflow generator.
 *
 * This file defines a Genkit flow that takes a startup idea as input and generates a comprehensive workflow to execute the idea.
 *
 * @module ai/ai-startup-generator
 *
 * @exports generateStartupWorkflow - A function that triggers the startup workflow generation flow.
 * @exports StartupIdeaInput - The input type for the generateStartupWorkflow function.
 * @exports StartupWorkflowOutput - The output type for the generateStartupWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Define the input schema for the startup idea
const StartupIdeaInputSchema = z.object({
  idea: z
    .string()
    .describe('A detailed description of the startup idea.'),
});
export type StartupIdeaInput = z.infer<typeof StartupIdeaInputSchema>;

const StartupWorkflowOutputSchema = z.object({
    startupName: z.string().describe('A catchy name for the startup.'),
    businessPlan: z.string().describe('A concise business plan.'),
    logoImageUrl: z.string().url().describe('URL for a generated logo.'),
    pitchDeckUrl: z.string().url().describe('URL for a generated pitch deck.'),
    workflow: z.string().describe('A comprehensive step-by-step workflow to execute the startup idea.'),
});
export type StartupWorkflowOutput = z.infer<typeof StartupWorkflowOutputSchema>;


const workflowPrompt = ai.definePrompt({
  name: 'workflowPrompt',
  input: {schema: StartupIdeaInputSchema},
  output: {schema: StartupWorkflowOutputSchema},
  prompt: `You are an AI-powered business expert. Based on the following startup idea, generate the following:
1. A catchy name for the startup.
2. A concise business plan.
3. A step-by-step workflow to execute the idea.
4. A placeholder URL for a logo image. Use https://picsum.photos/seed/logo/512/512.
5. A URL for a pitch deck.

Startup Idea: {{{idea}}}.

Output the results in JSON format. For the pitchDeckUrl, create a Google Slides URL.`,
});

export const generateStartupWorkflow = ai.defineFlow(
  {
    name: 'generateStartupWorkflow',
    inputSchema: StartupIdeaInputSchema,
    outputSchema: StartupWorkflowOutputSchema,
  },
  async (input) => {
    const response = await workflowPrompt(input);
    const output = response.output!;

    // Ensure the pitch deck URL is valid
    const presentationTitle = encodeURIComponent(`${output.startupName} Pitch Deck`);
    output.pitchDeckUrl = `https://docs.google.com/presentation/create?title=${presentationTitle}`;
    
    // Ensure the logo URL is a placeholder
    output.logoImageUrl = `https://picsum.photos/seed/${encodeURIComponent(output.startupName)}/512/512`;

    return output;
  }
);
