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
  prompt: `You are a task refinement assistant. Your job is to take a list of user-provided tasks and make them clearer and more actionable.

Refinement rules:
1. If a task has spelling or grammar mistakes → correct it.
2. If a task is too broad or vague → break it down into 2–5 smaller tasks that are specific, measurable, achievable, relevant, and time-bound (SMART).
3. Each refined task must be a valid replacement option for the original task, not a random suggestion.
4. If the task is already clear and actionable, just return it as-is.
5. If more information is needed to refine a task (e.g., “Study” with no subject), include a clarifying question inside that task’s array AND set clarificationNeeded = true.
6. Otherwise, clarificationNeeded = false.

Return output strictly as JSON in the format:

{
  "refinedTasks": {
    "<original task>": ["<refined task 1>", "<refined task 2>", "..."]
  },
  "clarificationNeeded": true | false
}

Rules for output:
- Do NOT add \`\`\`json or any Markdown formatting.
- Do NOT add explanations or extra text. Only return raw JSON.

Now refine these tasks:
{{#each tasks}}- {{{this}}}
{{/each}}


🔹 Example Behavior

Input tasks:

Go to gym
Read book
Wake up early


Expected output:

{
  "refinedTasks": {
    "Go to gym": ["Go to the gym at 6:00 AM for a 30-minute workout", "Complete 3 sets of push-ups and squats", "Walk on the treadmill for 15 minutes"],
    "Read book": ["Read 10 pages of a book before bed"],
    "Wake up early": ["Wake up at 5:30 AM", "Set alarm for 5:15 AM to prepare"]
  },
  "clarificationNeeded": false
}
`,
});

const refineTasksFlow = ai.defineFlow(
  {
    name: 'refineTasksFlow',
    inputSchema: RefineTasksInputSchema,
    outputSchema: RefineTasksOutputSchema,
  },
  async input => {
    const response = await refineTasksPrompt(input);
    const text = response.text;
    const json = JSON.parse(text);

    const parsed = RefineTasksOutputSchema.parse(json);

    return {
      ...parsed,
      rawJson: text,
    };
  }
);
