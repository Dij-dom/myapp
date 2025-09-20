'use server';

import { refineTasks } from '@/ai/flows/refine-tasks-with-gemini';
import { provideTargetedSuggestions } from '@/ai/flows/provide-targeted-suggestions';
import { redirect } from 'next/navigation';
import type { CompletedTask, MissedTask, FinalizedTask } from './types';
import { toast } from '@/hooks/use-toast';

export async function refineTasksAction(tasks: string[], existingTasks?: FinalizedTask[]) {
  if (!tasks || tasks.length === 0) {
    throw new Error('No tasks provided.');
  }

  const tasksToRefine = existingTasks 
    ? tasks.filter(t => !existingTasks.some(et => et.originalTask === t))
    : tasks;

  if (tasksToRefine.length === 0) {
    redirect('/dashboard');
  }

  let result;
  try {
    result = await refineTasks({ tasks: tasksToRefine });
  } catch (error) {
    console.error('Error refining tasks:', error);
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    throw new Error(error instanceof Error ? `Failed to get suggestions from AI: ${error.message}` : 'Failed to get suggestions from AI due to an unknown error.');
  }

  if (result.clarificationNeeded) {
    // This is not a real redirect, but a way to communicate an error message
    // back to the client. The client-side toast hook will not actually execute a redirect.
    // This is a bit of a workaround because server actions can't directly trigger client-side toasts.
    // A better implementation would involve returning a state from the action.
    // For now, we will simulate a redirect with an error that we can catch.
    try {
       toast({
        title: 'Tasks unclear',
        description: "Some of your tasks were unclear to the AI. Please try rephrasing them with more detail.",
        variant: 'destructive'
      });
    } catch(e) {
      // we expect this to fail, but we will redirect
    }
    redirect('/');
  }
  
  let url = `/review?data=${encodeURIComponent(JSON.stringify(result))}`;
  if (existingTasks && existingTasks.length > 0) {
    url += `&existing=${encodeURIComponent(JSON.stringify(existingTasks))}`;
  }
  redirect(url);
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
