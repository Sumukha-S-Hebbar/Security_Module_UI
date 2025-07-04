// src/ai/flows/analyze-selfie-compliance.ts
'use server';

/**
 * @fileOverview Analyzes security guard selfie compliance.
 *
 * - analyzeSelfieCompliance - Analyzes if security guards are consistently missing their requested selfies.
 * - AnalyzeSelfieComplianceInput - The input type for the analyzeSelfieCompliance function.
 * - AnalyzeSelfieComplianceOutput - The return type for the analyzeSelfieCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSelfieComplianceInputSchema = z.object({
  guardId: z.string().describe('The ID of the security guard.'),
  missedSelfieCount: z
    .number()
    .describe('The number of selfies the guard has missed.'),
  totalSelfieRequests: z
    .number()
    .describe('The total number of selfie requests for the guard.'),
});
export type AnalyzeSelfieComplianceInput = z.infer<
  typeof AnalyzeSelfieComplianceInputSchema
>;

const AnalyzeSelfieComplianceOutputSchema = z.object({
  complianceIssueIdentified: z
    .boolean()
    .describe('Whether a compliance issue has been identified.'),
  analysis: z.string().describe('The analysis of the selfie compliance.'),
  recommendations: z.string().describe('Recommendations for the supervisor.'),
});
export type AnalyzeSelfieComplianceOutput = z.infer<
  typeof AnalyzeSelfieComplianceOutputSchema
>;

export async function analyzeSelfieCompliance(
  input: AnalyzeSelfieComplianceInput
): Promise<AnalyzeSelfieComplianceOutput> {
  return analyzeSelfieComplianceFlow(input);
}

const analyzeSelfieCompliancePrompt = ai.definePrompt({
  name: 'analyzeSelfieCompliancePrompt',
  input: {schema: AnalyzeSelfieComplianceInputSchema},
  output: {schema: AnalyzeSelfieComplianceOutputSchema},
  prompt: `You are an AI assistant helping supervisors analyze security guard selfie compliance.

You will receive the guard's ID, the number of missed selfies, and the total number of selfie requests.

Based on this information, determine if there is a compliance issue. If the missedSelfieCount is more than 20% of the totalSelfieRequests, then complianceIssueIdentified should be true.

Provide a brief analysis of the situation and recommendations for the supervisor on how to address the issue.

Guard ID: {{{guardId}}}
Missed Selfies: {{{missedSelfieCount}}}
Total Selfie Requests: {{{totalSelfieRequests}}}

Consider that the security guards might have valid reasons to miss the selfie, such as illness, vacation, emergency situation.

Output:
```,
});

const analyzeSelfieComplianceFlow = ai.defineFlow(
  {
    name: 'analyzeSelfieComplianceFlow',
    inputSchema: AnalyzeSelfieComplianceInputSchema,
    outputSchema: AnalyzeSelfieComplianceOutputSchema,
  },
  async input => {
    const {output} = await analyzeSelfieCompliancePrompt(input);
    return output!;
  }
);
