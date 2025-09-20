'use server';

import { refineTasks } from '@/ai/flows/refine-tasks-with-gemini';
import { provideTargetedSuggestions } from '@/ai/flows/provide-targeted-suggestions';
import { redirect } from 'next/navigation';
import type { CompletedTask, MissedTask } from './types';

export async function refineTasksAction(tasks: string[]) {
  if (!tasks || tasks.length === 0) {
    throw new Error('No tasks provided.');
  }

  try {
    const result = await refineTasks({ tasks });
    const dataStr = encodeURIComponent(JSON.stringify(result));
    redirect(`/review?data=${dataStr}`);
  } catch (error) {
    console.error('Error refining tasks:', error);
    // In a real app, you'd want to handle this more gracefully
    throw new Error('Failed to get suggestions from AI.');
  }
}

export async function getTargetedSuggestionsAction(completedTasks: CompletedTask[], missedTasks: MissedTask[]) {
   try {
    const result = await provideTargetedSuggestions({ 
      completedTasks: completedTasks.map(t => ({task: t.task})),
      missedTasks: missedTasks.map(t => ({task: t.task, reason: t.reason})),
     });
    return result.suggestions;
  } catch (error) {
    console.error('Error getting targeted suggestions:', error);
    return ["We couldn't generate suggestions at this time. Please try again later."];
  }
}
