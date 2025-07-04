// src/ai/flows/summarize-emergency-call.ts
'use server';

/**
 * @fileOverview Summarizes emergency calls by extracting key details.
 *
 * - summarizeEmergencyCall - A function that summarizes emergency call details.
 * - SummarizeEmergencyCallInput - The input type for the summarizeEmergencyCall function.
 * - SummarizeEmergencyCallOutput - The return type for the summarizeEmergencyCall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEmergencyCallInputSchema = z.object({
  callDetails: z.string().describe('Details of the emergency call.'),
});
export type SummarizeEmergencyCallInput = z.infer<typeof SummarizeEmergencyCallInputSchema>;

const SummarizeEmergencyCallOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the emergency call including location, time, and nature of the emergency.'),
});
export type SummarizeEmergencyCallOutput = z.infer<typeof SummarizeEmergencyCallOutputSchema>;

export async function summarizeEmergencyCall(input: SummarizeEmergencyCallInput): Promise<SummarizeEmergencyCallOutput> {
  return summarizeEmergencyCallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEmergencyCallPrompt',
  input: {schema: SummarizeEmergencyCallInputSchema},
  output: {schema: SummarizeEmergencyCallOutputSchema},
  prompt: `You are an emergency call summarization expert. Summarize the following emergency call details, extracting the location, time, and nature of the emergency. Be concise.

Emergency Call Details: {{{callDetails}}}`,
});

const summarizeEmergencyCallFlow = ai.defineFlow(
  {
    name: 'summarizeEmergencyCallFlow',
    inputSchema: SummarizeEmergencyCallInputSchema,
    outputSchema: SummarizeEmergencyCallOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
