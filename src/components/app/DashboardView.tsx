'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ListTodo, PlusCircle, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardView() {
  const router = useRouter();
  const { plan, loading, setPlan } = useAuth();
  
  const startNewDay = async () => {
    await setPlan(null);
    router.push('/');
  };
  
  if (loading) {
    return null;
  }

  if (!plan || plan.tasks.length === 0) {
    return (
      <Card className="text-center w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <ListTodo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline">No Plan for Today</CardTitle>
          <CardDescription>
            You haven't created a plan yet. Let's get started!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/')} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Today's Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tasksByOriginal = plan.tasks.reduce((acc, task) => {
    (acc[task.originalTask] = acc[task.originalTask] || []).push(task);
    return acc;
  }, {} as Record<string, typeof plan.tasks>);

  const canAddMore = Object.keys(tasksByOriginal).length < 5;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-left">
              <h1 className="text-3xl font-bold font-headline">Today's Plan</h1>
              <p className="text-muted-foreground">
                Here are your goals for {new Date(plan.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
          </div>
          {canAddMore && (
              <Button variant="outline" onClick={() => router.push('/')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add More Tasks
              </Button>
          )}
        </div>
      
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(tasksByOriginal).map(([originalTask, microTasks]) => (
            <Card key={originalTask}>
            <CardHeader>
                <CardTitle className="font-headline text-xl">{originalTask}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {microTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm">{task.text}</p>
                </div>
                ))}
            </CardContent>
            </Card>
        ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-8 border-t">
             <Button variant="outline" onClick={startNewDay}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Start a New Day
            </Button>
            <Button onClick={() => router.push('/daily-review')} className="bg-accent hover:bg-accent/90">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Proceed to Daily Review
            </Button>
        </div>
    </div>
  );
}
