'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type RawAIData, type RefinedTask, type MicroTask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Check, ThumbsDown, ThumbsUp, Pencil, Save, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';

interface SuggestionReviewProps {
  initialData: RawAIData;
}

export default function SuggestionReview({ initialData }: SuggestionReviewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const [refinedTasks, setRefinedTasks] = useState<RefinedTask[]>(() => {
    return Object.entries(initialData.refinedTasks).map(([originalTask, microTaskStrings]) => ({
      originalTask,
      microTasks: microTaskStrings.map((text) => ({
        id: crypto.randomUUID(),
        text,
        originalText: text,
        status: 'pending',
      })),
    }));
  });
  
  const getPlanKey = () => `dailyPlan_${user?.uid}`;

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  const handleStatusChange = (taskIndex: number, microTaskId: string, status: MicroTask['status']) => {
    const newRefinedTasks = [...refinedTasks];
    const microTask = newRefinedTasks[taskIndex].microTasks.find((mt) => mt.id === microTaskId);
    if (microTask) {
      if (microTask.status !== 'pending') return;
      microTask.status = status;
      setRefinedTasks(newRefinedTasks);
    }
  };
  
  const handleTextChange = (taskIndex: number, microTaskId: string, newText: string) => {
    const newRefinedTasks = [...refinedTasks];
    const microTask = newRefinedTasks[taskIndex].microTasks.find((mt) => mt.id === microTaskId);
    if (microTask) {
      microTask.text = newText;
    }
    setRefinedTasks(newRefinedTasks);
  };
  
  const startEditing = (taskIndex: number, microTaskId: string) => {
    const newRefinedTasks = [...refinedTasks];
    const microTask = newRefinedTasks[taskIndex].microTasks.find(mt => mt.id === microTaskId);
    if (microTask) {
      if (microTask.status !== 'pending') return;
      microTask.status = 'edited';
      setRefinedTasks(newRefinedTasks);
    }
  }

  const allReviewed = refinedTasks.every((rt) => rt.microTasks.every((mt) => mt.status !== 'pending'));

  const finalizePlan = () => {
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to save a plan.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }
  
    const finalPlan = refinedTasks.flatMap(rt => 
      rt.microTasks
        .filter(mt => mt.status === 'approved' || mt.status === 'edited')
        .map(mt => ({
          id: mt.id,
          text: mt.text,
          originalTask: rt.originalTask,
        }))
    );
    
    if (finalPlan.length === 0) {
        toast({
            title: "No micro-tasks approved",
            description: "You can create a plan with no tasks, but it's more effective to approve at least one!",
            variant: "default"
        });
    }

    const dailyPlan = {
      date: new Date().toISOString(),
      tasks: finalPlan,
    }

    localStorage.setItem(getPlanKey(), JSON.stringify(dailyPlan));
    toast({
      title: 'Plan Finalized!',
      description: 'Your daily plan has been saved.',
    });
    router.push('/dashboard');
  };

  const statusColors: Record<MicroTask['status'], string> = {
    pending: 'bg-secondary text-secondary-foreground',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    edited: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <div className="w-full">
      {initialData.clarificationNeeded && (
        <Alert className="mb-4 bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700/50 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4 !text-yellow-800 dark:!text-yellow-300" />
            <AlertDescription>
                Some of your tasks were unclear. We've added questions to help you clarify them. You can edit the tasks below.
            </AlertDescription>
        </Alert>
      )}

      <Carousel setApi={setApi} className="w-full" opts={{
        active: refinedTasks.length > 1,
        watchDrag: refinedTasks.length > 1,
      }}>
        <CarouselContent>
          {refinedTasks.map((task, taskIndex) => (
            <CarouselItem key={task.originalTask}>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">{task.originalTask}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {task.microTasks.map((microTask) => (
                    <div key={microTask.id} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                      <Badge className={`capitalize ${statusColors[microTask.status]}`}>{microTask.status}</Badge>
                      <div className="flex-grow">
                        {microTask.status === 'edited' ? (
                          <Input value={microTask.text} onChange={e => handleTextChange(taskIndex, microTask.id, e.target.value)} />
                        ) : (
                          <p className="text-sm">{microTask.text}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {microTask.status === 'edited' ? (
                            <Button size="icon" variant="ghost" onClick={() => handleStatusChange(taskIndex, microTask.id, 'approved')}>
                                <Save className="w-5 h-5 text-blue-500" />
                            </Button>
                        ) : (
                            <>
                                <Button size="icon" variant="ghost" onClick={() => handleStatusChange(taskIndex, microTask.id, 'approved')} disabled={microTask.status !== 'pending'}>
                                    <ThumbsUp className="w-5 h-5 text-green-500" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => startEditing(taskIndex, microTask.id)} disabled={microTask.status !== 'pending'}>
                                    <Pencil className="w-5 h-5 text-gray-500" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleStatusChange(taskIndex, microTask.id, 'rejected')} disabled={microTask.status !== 'pending'}>
                                    <ThumbsDown className="w-5 h-5 text-red-500" />
                                </Button>
                            </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {refinedTasks.length > 1 && (
          <>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex"/>
          </>
        )}
      </Carousel>
      {refinedTasks.length > 1 && (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Task {current} of {count}
        </div>
      )}
      {allReviewed && (
        <div className="mt-6 flex justify-center">
          <Button onClick={finalizePlan} size="lg" className="bg-accent hover:bg-accent/90">
            <Check className="mr-2 h-4 w-4" />
            Finalize My Plan
          </Button>
        </div>
      )}
    </div>
  );
}
