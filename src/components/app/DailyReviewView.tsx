'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DailyPlan, CompletedTask, MissedTask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Wand2, Lightbulb, ListTodo, PlusCircle } from 'lucide-react';
import { getTargetedSuggestionsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';

export default function DailyReviewView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { toast } = useToast();
  const { user, plan, loading } = useAuth();
  
  const handleReasonChange = (taskId: string, reason: string) => {
    setReasons(prev => ({ ...prev, [taskId]: reason }));
  };

  const handleCheckboxChange = (taskId: string, isChecked: boolean) => {
    setCompleted(prev => ({ ...prev, [taskId]: isChecked }));
  };

  const handleSubmitReview = () => {
    if (!plan) return;

    const completedTasks: CompletedTask[] = [];
    const missedTasks: MissedTask[] = [];

    plan.tasks.forEach(task => {
      if (completed[task.id]) {
        completedTasks.push({ id: task.id, task: task.text });
      } else {
        missedTasks.push({ id: task.id, task: task.text, reason: reasons[task.id] || 'No reason provided' });
      }
    });

    startTransition(async () => {
      try {
        const result = await getTargetedSuggestionsAction(completedTasks, missedTasks);
        setSuggestions(result);
        setIsSuggestionsOpen(true);
      } catch (error) {
        toast({ title: "Failed to get suggestions", variant: "destructive" });
      }
    });
  };

  if (loading) {
    return null;
  }
  
  if (!plan) {
    return (
      <Card className="text-center w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <ListTodo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline">Nothing to Review</CardTitle>
          <CardDescription>
            You don't have a plan to review. Start by creating one!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create a Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Daily Review</CardTitle>
          <CardDescription>
            Review your plan from {new Date(plan.date).toLocaleDateString()}. Check off what you completed and provide reasons for what you missed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {plan.tasks.map((task, index) => (
            <div key={task.id} className="p-4 rounded-lg border">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`task-${index}`}
                  className="mt-1 h-5 w-5"
                  checked={completed[task.id] || false}
                  onCheckedChange={(isChecked) => handleCheckboxChange(task.id, !!isChecked)}
                />
                <Label htmlFor={`task-${index}`} className="flex-grow text-base">{task.text}</Label>
              </div>
              {!completed[task.id] && (
                <div className="mt-4 ml-9 space-y-2">
                  <Label htmlFor={`reason-${index}`} className="text-sm font-medium text-muted-foreground">Why was this task missed?</Label>
                  <Textarea
                    id={`reason-${index}`}
                    placeholder="e.g., I ran out of time, or I wasn't feeling motivated..."
                    value={reasons[task.id] || ''}
                    onChange={(e) => handleReasonChange(task.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
          <Button onClick={handleSubmitReview} size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Get AI Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <AlertDialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <Lightbulb className="h-6 w-6 text-primary" />
              Targeted Suggestions
            </AlertDialogTitle>
            <AlertDialogDescription>
              Based on your review, here are some suggestions to help you improve.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
                 <div className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-primary" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
