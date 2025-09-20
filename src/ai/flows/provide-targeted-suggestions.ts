'use server';

/**
 * @fileOverview AI flow to provide targeted suggestions based on completed and missed tasks.
 *
 * - provideTargetedSuggestions - A function that provides targeted suggestions.
 * - ProvideTargetedSuggestionsInput - The input type for the provideTargetedSuggestions function.
 * - ProvideTargetedSuggestionsOutput - The return type for the provideTargetedSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideTargetedSuggestionsInputSchema = z.object({
  completedTasks: z.array(
    z.object({
      task: z.string(),
    })
  ).describe('Array of completed tasks with their descriptions.'),
  missedTasks: z.array(
    z.object({
      task: z.string(),
      reason: z.string(),
    })
  ).describe('Array of missed tasks with reasons for not completing them.'),
});
export type ProvideTargetedSuggestionsInput = z.infer<typeof ProvideTargetedSuggestionsInputSchema>;

const ProvideTargetedSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Array of targeted suggestions for the user.'),
  rawJson: z.string().optional().describe('Raw JSON output from the model for debugging.'),
});
export type ProvideTargetedSuggestionsOutput = z.infer<typeof ProvideTargetedSuggestionsOutputSchema>;

export async function provideTargetedSuggestions(
  input: ProvideTargetedSuggestionsInput
): Promise<ProvideTargetedSuggestionsOutput> {
  return provideTargetedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideTargetedSuggestionsPrompt',
  input: {schema: ProvideTargetedSuggestionsInputSchema},
  output: {schema: ProvideTargetedSuggestionsOutputSchema},
  prompt: `You are a personal improvement assistant. Provide targeted suggestions to the user based on their completed and missed tasks.

Completed Tasks:
{{#each completedTasks}}
- {{this.task}}
{{/each}}

Missed Tasks:
{{#each missedTasks}}
- Task: {{this.task}}, Reason: {{this.reason}}
{{/each}}

Suggestions (as an array of strings):
`,  config: { safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
  },
});

const provideTargetedSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideTargetedSuggestionsFlow',
    inputSchema: ProvideTargetedSuggestionsInputSchema,
    outputSchema: ProvideTargetedSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The model output already contains suggestions as an array of strings, so return the output.
    return {
      suggestions: output?.suggestions || [],
      rawJson: JSON.stringify(output),
    };
  }
);
