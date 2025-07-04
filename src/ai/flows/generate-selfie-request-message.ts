// use server'

/**
 * @fileOverview Generates personalized selfie request messages for security guards.
 *
 * - generateSelfieRequestMessage - A function that generates a personalized selfie request message for a security guard.
 * - GenerateSelfieRequestMessageInput - The input type for the generateSelfieRequestMessage function.
 * - GenerateSelfieRequestMessageOutput - The return type for the generateSelfieRequestMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfieRequestMessageInputSchema = z.object({
  guardName: z.string().describe('The name of the security guard.'),
  siteName: z.string().describe('The name of the site the guard is assigned to.'),
  time: z.string().describe('The current time.'),
});
export type GenerateSelfieRequestMessageInput = z.infer<typeof GenerateSelfieRequestMessageInputSchema>;

const GenerateSelfieRequestMessageOutputSchema = z.object({
  message: z.string().describe('The personalized selfie request message.'),
});
export type GenerateSelfieRequestMessageOutput = z.infer<typeof GenerateSelfieRequestMessageOutputSchema>;

export async function generateSelfieRequestMessage(
  input: GenerateSelfieRequestMessageInput
): Promise<GenerateSelfieRequestMessageOutput> {
  return generateSelfieRequestMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSelfieRequestMessagePrompt',
  input: {schema: GenerateSelfieRequestMessageInputSchema},
  output: {schema: GenerateSelfieRequestMessageOutputSchema},
  prompt: `Generate a personalized selfie request message for security guard {{guardName}} at site {{siteName}}. The current time is {{time}}. The message should remind the guard to take a selfie to ensure security protocols are being followed.`,
});

const generateSelfieRequestMessageFlow = ai.defineFlow(
  {
    name: 'generateSelfieRequestMessageFlow',
    inputSchema: GenerateSelfieRequestMessageInputSchema,
    outputSchema: GenerateSelfieRequestMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
