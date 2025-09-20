'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type RawAIData, type RefinedTask, type MicroTask, type FinalizedTask, type DailyPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Check, ThumbsDown, ThumbsUp, Pencil, Save, AlertCircle, LoaderCircle, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';

interface SuggestionReviewProps {
  initialData: RawAIData;
}

const isClarificationNeeded = (microTaskText: string) => {
    return microTaskText.includes('?');
}

export default function SuggestionReview({ initialData }: SuggestionReviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, setPlan, loading: authLoading } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const [existingTasks, setExistingTasks] = useState<FinalizedTask[]>([]);
  
  const [refinedTasks, setRefinedTasks] = useState<RefinedTask[]>(() => {
    return Object.entries(initialData.refinedTasks).map(([originalTask, microTaskStrings]) => ({
      originalTask,
      microTasks: microTaskStrings.map((text) => ({
        id: crypto.randomUUID(),
        text,
        originalText: text,
        status: isClarificationNeeded(text) ? 'edited' : 'pending',
      })),
    }));
  });

  const clarificationNeeded = refinedTasks.some(rt => rt.microTasks.some(mt => isClarificationNeeded(mt.originalText)));
  

  useEffect(() => {
    const existing = searchParams.get('existing');
    if (existing) {
      setExistingTasks(JSON.parse(decodeURIComponent(existing)));
    }
  }, [searchParams]);

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
       if (microTask.status === status && status !== 'edited') {
        microTask.status = 'pending';
      } else {
        microTask.status = status;
      }
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
      if (microTask.status === 'rejected') return;
      microTask.status = 'edited';
      setRefinedTasks(newRefinedTasks);
    }
  }
  
  const saveEditedTask = (taskIndex: number, microTaskId: string) => {
    const newRefinedTasks = [...refinedTasks];
    const microTask = newRefinedTasks[taskIndex].microTasks.find(mt => mt.id === microTaskId);
    if (microTask && microTask.text !== microTask.originalText && !isClarificationNeeded(microTask.text)) {
        microTask.status = 'approved';
        setRefinedTasks(newRefinedTasks);
    }
  }


  const allReviewed = refinedTasks.every((rt) => rt.microTasks.every((mt) => mt.status !== 'pending' && mt.status !== 'edited'));

  const finalizePlan = async () => {
    setIsFinalizing(true);
    try {
      if (!user) {
          toast({
              title: "Authentication Error",
              description: "You must be logged in to save a plan. Redirecting to login.",
              variant: "destructive"
          });
          router.push('/login');
          return;
      }
    
      const newFinalizedTasks = refinedTasks.flatMap(rt => 
        rt.microTasks
          .filter(mt => mt.status === 'approved')
          .map(mt => ({
            id: mt.id,
            text: mt.text,
            originalTask: rt.originalTask,
          }))
      );

      const finalPlanTasks = [...existingTasks, ...newFinalizedTasks];
      
      const dailyPlan: DailyPlan = {
        date: new Date().toISOString(),
        tasks: finalPlanTasks,
      }
      
      await setPlan(dailyPlan);
      
      toast({
          title: 'Plan Finalized!',
          description: 'Your daily plan has been saved.',
      });
      setIsFinalized(true);

    } catch (error) {
        toast({
            title: "Failed to Finalize Plan",
            description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsFinalizing(false);
    }
  };

  const getStatusButtonClass = (taskStatus: MicroTask['status'], buttonStatus: MicroTask['status']) => {
     if (taskStatus === 'edited') return 'text-gray-400 dark:text-gray-600';
    if (taskStatus === 'pending') return 'text-gray-500';
    if (taskStatus === buttonStatus) {
      switch(buttonStatus) {
        case 'approved': return 'text-green-500 bg-green-100 dark:bg-green-900';
        case 'rejected': return 'text-red-500 bg-red-100 dark:bg-red-900';
        default: return 'text-gray-500';
      }
    }
    return 'text-gray-400 dark:text-gray-600';
  };

  const statusColors: Record<MicroTask['status'], string> = {
    pending: 'bg-secondary text-secondary-foreground',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/50',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-500/50',
    edited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-500/50',
  };

  return (
    <div className="w-full">
      {clarificationNeeded && (
        <Alert className="mb-4 bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700/50 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4 !text-yellow-800 dark:!text-yellow-300" />
            <AlertDescription>
                Some of your tasks were unclear. We've added questions to help you clarify them. Please edit the tasks below.
            </AlertDescription>
        </Alert>
      )}

      <Carousel setApi={setApi} className="w-full" opts={{
        watchDrag: refinedTasks.length > 1,
        draggable: refinedTasks.length > 1,
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
                      <Badge variant="outline" className={`capitalize ${statusColors[microTask.status]}`}>{microTask.status}</Badge>
                      <div className="flex-grow">
                        {microTask.status === 'edited' ? (
                          <Input value={microTask.text} onChange={e => handleTextChange(taskIndex, microTask.id, e.target.value)} onBlur={() => saveEditedTask(taskIndex, microTask.id)} />
                        ) : (
                          <p className="text-sm">{microTask.text}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {microTask.status === 'edited' ? (
                            <Button size="icon" variant="ghost" onClick={() => saveEditedTask(taskIndex, microTask.id)}>
                                <Save className="w-5 h-5 text-blue-500" />
                            </Button>
                        ) : (
                            <>
                                <Button size="icon" variant="ghost" onClick={() => handleStatusChange(taskIndex, microTask.id, 'approved')} className={getStatusButtonClass(microTask.status, 'approved')} disabled={microTask.status === 'edited'}>
                                    <ThumbsUp className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => startEditing(taskIndex, microTask.id)} disabled={microTask.status === 'rejected' || microTask.status === 'edited'}>
                                    <Pencil className={`w-5 h-5 ${microTask.status === 'rejected' ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500'}`} />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleStatusChange(taskIndex, microTask.id, 'rejected')} className={getStatusButtonClass(microTask.status, 'rejected')} disabled={microTask.status === 'edited'}>
                                    <ThumbsDown className="w-5 h-5" />
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
        <div className="mt-6 flex justify-center items-center gap-4">
          {isFinalized ? (
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              View Dashboard
            </Button>
          ) : (
            <Button onClick={finalizePlan} size="lg" className="bg-accent hover:bg-accent/90" disabled={authLoading || isFinalizing}>
              {isFinalizing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {isFinalizing ? 'Finalizing...' : 'Finalize My Plan'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
