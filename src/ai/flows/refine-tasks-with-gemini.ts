'use server';

/**
 * @fileOverview Refines user-defined tasks into actionable micro-tasks using Google Gemini.
 *
 * - refineTasks - A function that refines tasks and returns a JSON output.
 * - RefineTasksInput - The input type for the refineTasks function.
 * - RefineTasksOutput - The return type for the refineTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineTasksInputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of tasks to be refined into micro-tasks.'),
});
export type RefineTasksInput = z.infer<typeof RefineTasksInputSchema>;

const RefineTasksOutputSchema = z.object({
  refinedTasks: z.record(z.string(), z.array(z.string())).describe(
    'A JSON object where each key is the original task, and the value is an array of refined micro-tasks.'
  ),
  clarificationNeeded: z.boolean().describe('Whether clarification is needed for any of the tasks.'),
  rawJson: z.string().optional().describe('The raw JSON output from the model for debugging purposes.'),
});
export type RefineTasksOutput = z.infer<typeof RefineTasksOutputSchema>;

export async function refineTasks(input: RefineTasksInput): Promise<RefineTasksOutput> {
  return refineTasksFlow(input);
}

const refineTasksPrompt = ai.definePrompt({
  name: 'refineTasksPrompt',
  input: {schema: RefineTasksInputSchema},
  output: {schema: RefineTasksOutputSchema, format: 'json'},
  prompt: `You are a task refinement expert. Your job is to take a list of high-level tasks and break them down into smaller, actionable micro-tasks.

Here are the tasks:
{{#each tasks}}- {{{this}}}
{{/each}}

Return a JSON object where each key is the original task, and the value is an array of refined micro-tasks. Ensure that the micro-tasks are specific, measurable, achievable, relevant, and time-bound (SMART).
Also include a boolean named clarificationNeeded, and set it to true if any of the tasks require further clarification from the user. If you set clarificationNeeded to true, the micro-tasks should include a question to ask the user.

Example:
{
  "refinedTasks": {
    "Learn a new language": ["Sign up for a Duolingo course (15 minutes)", "Practice Spanish vocabulary for 20 minutes", "Watch a short Spanish-language video on YouTube", "What kind of language do you want to learn?"],
    "Get in shape": ["Go for a 30-minute jog in the park", "Do a 15-minute bodyweight workout", "Prepare a healthy lunch"],
    "Read more books": ["Read 20 pages of 'The Hitchhiker's Guide to the Galaxy'", "Write a book review", "What genres are you interested in?"]
  },
  "clarificationNeeded": true
}

Ensure that the JSON is valid and can be parsed without errors.

Output:
`,
});

const refineTasksFlow = ai.defineFlow(
  {
    name: 'refineTasksFlow',
    inputSchema: RefineTasksInputSchema,
    outputSchema: RefineTasksOutputSchema,
  },
  async input => {
    const {output} = await refineTasksPrompt(input);

    // Add raw JSON to output for debugging purposes
    return {
      ...output!,
      rawJson: JSON.stringify(output),
    };
  }
);
