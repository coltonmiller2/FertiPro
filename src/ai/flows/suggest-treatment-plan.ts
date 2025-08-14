'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting plant treatment plans based on plant conditions.
 *
 * - suggestTreatmentPlan - A function that takes plant parameters and returns a suggested treatment plan.
 * - SuggestTreatmentPlanInput - The input type for the suggestTreatmentPlan function.
 * - SuggestTreatmentPlanOutput - The return type for the suggestTreatmentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTreatmentPlanInputSchema = z.object({
  phLevel: z.string().describe('The pH level of the soil.'),
  treatment: z.string().describe('The current treatment applied to the plant.'),
  moistureLevel: z.string().describe('The moisture level of the soil.'),
  plantType: z.string().describe('The type of plant.'),
});

export type SuggestTreatmentPlanInput = z.infer<typeof SuggestTreatmentPlanInputSchema>;

const SuggestTreatmentPlanOutputSchema = z.object({
  suggestedTreatmentPlan: z.string().describe('A suggested treatment plan for the plant.'),
});

export type SuggestTreatmentPlanOutput = z.infer<typeof SuggestTreatmentPlanOutputSchema>;

export async function suggestTreatmentPlan(input: SuggestTreatmentPlanInput): Promise<SuggestTreatmentPlanOutput> {
  return suggestTreatmentPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentPlanPrompt',
  input: {schema: SuggestTreatmentPlanInputSchema},
  output: {schema: SuggestTreatmentPlanOutputSchema},
  prompt: `You are an expert in plant care. Based on the plant's current condition, suggest a treatment plan.

Plant Type: {{{plantType}}}
PH Level: {{{phLevel}}}
Current Treatment: {{{treatment}}}
Moisture Level: {{{moistureLevel}}}

Suggested Treatment Plan:`, 
});

const suggestTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentPlanFlow',
    inputSchema: SuggestTreatmentPlanInputSchema,
    outputSchema: SuggestTreatmentPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
