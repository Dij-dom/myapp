import { type RefineTasksOutput } from "@/ai/flows/refine-tasks-with-gemini";

export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export interface MicroTask {
  id: string;
  text: string;
  status: TaskStatus;
  originalText: string;
}

export interface FinalizedTask {
  id: string;
  text: string;
  originalTask: string;
}

export interface RefinedTask {
  originalTask: string;
  microTasks: MicroTask[];
}

export type RawAIData = RefineTasksOutput;

export interface DailyPlan {
  date: string;
  tasks: FinalizedTask[];
}

export interface CompletedTask {
  id: string;
  task: string;
}

export interface MissedTask {
  id: string;
  task: string;
  reason: string;
}
