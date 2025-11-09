'use server';

/**
 * @fileOverview An AI meeting assistant for summarizing tasks and sending meeting notes.
 *
 * - summarizeMeeting - A function that summarizes meeting tasks and generates notes.
 * - SummarizeMeetingInput - The input type for the summarizeMeeting function.
 * - SummarizeMeetingOutput - The return type for the summarizeMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingInputSchema = z.object({
  meetingTranscript: z
    .string()
    .describe('The transcript of the meeting to summarize.'),
});
export type SummarizeMeetingInput = z.infer<typeof SummarizeMeetingInputSchema>;

const SummarizeMeetingOutputSchema = z.object({
  summary: z.string().describe('A summary of the meeting, including key decisions and action items.'),
  notes: z.string().describe('Meeting notes with a focus on actionable items.'),
});
export type SummarizeMeetingOutput = z.infer<typeof SummarizeMeetingOutputSchema>;

export async function summarizeMeeting(input: SummarizeMeetingInput): Promise<SummarizeMeetingOutput> {
  return summarizeMeetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingPrompt',
  input: {schema: SummarizeMeetingInputSchema},
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing meetings and creating actionable notes.

  Given the following meeting transcript, generate a concise summary and a set of meeting notes that highlight action items and key decisions.

  Meeting Transcript:
  {{meetingTranscript}}

  Summary:
  (A brief summary of the meeting's key points and decisions)

  Notes:
  (Actionable notes focusing on who needs to do what, and by when)`,
});

const summarizeMeetingFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingFlow',
    inputSchema: SummarizeMeetingInputSchema,
    outputSchema: SummarizeMeetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
