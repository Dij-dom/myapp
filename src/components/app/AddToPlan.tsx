'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, LoaderCircle } from 'lucide-react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { DailyPlan } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { refineTasksAction } from '@/lib/actions';

const formSchema = z.object({
  tasks: z.array(z.object({ value: z.string().min(3, 'Task must be at least 3 characters.') })),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface AddToPlanProps {
    currentPlan: DailyPlan;
}

export default function AddToPlan({ currentPlan }: AddToPlanProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const remainingTasks = 5 - currentPlan.tasks.length;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema.extend({
        tasks: z.array(z.object({ value: z.string().min(3, 'Task must be at least 3 characters.') })).max(remainingTasks),
    })),
    defaultValues: {
        tasks: [{ value: '' }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'tasks',
    control: form.control,
  });

  const onSubmit = (data: TaskFormValues) => {
    const newTasks = data.tasks.map((task) => task.value).filter(Boolean);
    if (newTasks.length === 0) {
      toast({
        title: 'No tasks entered',
        description: 'Please enter at least one task.',
        variant: 'destructive',
      });
      return;
    }
    
    const allTasks = [...currentPlan.tasks.map(t => t.originalTask), ...newTasks];

    startTransition(async () => {
        try {
            await refineTasksAction(allTasks, currentPlan.tasks);
        } catch(e) {
             if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
                // Let redirect happen
                throw e;
             }
             toast({
                title: 'Failed to add tasks',
                description: e instanceof Error ? e.message : 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
    });

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`tasks.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder={`New Task #${index + 1}`} {...field} className="text-base" />
                    </FormControl>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                      <span className="sr-only">Remove task</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} disabled={fields.length >= remainingTasks}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Another Task
          </Button>

          <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto" disabled={isPending || !form.formState.isValid}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Updating Plan...
              </>
            ) : (
              'Update My Plan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
