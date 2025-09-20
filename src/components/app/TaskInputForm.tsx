'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, LoaderCircle } from 'lucide-react';
import { refineTasksAction } from '@/lib/actions';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  tasks: z.array(z.object({ value: z.string().min(3, 'Task must be at least 3 characters.') })).max(5),
});

type TaskFormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<TaskFormValues> = {
  tasks: [{ value: '' }],
};

export default function TaskInputForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'tasks',
    control: form.control,
  });

  const onSubmit = (data: TaskFormValues) => {
    const tasks = data.tasks.map((task) => task.value).filter(Boolean);
    if (tasks.length === 0) {
      toast({
        title: 'No tasks entered',
        description: 'Please enter at least one task.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        await refineTasksAction(tasks);
      } catch (error) {
        // The action redirects, but if it throws, we catch it here.
        // We specifically look for the toast-related "error" to display a message.
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
           try {
            const code = error.message.match(/NEXT_REDIRECT\n(.*)\n/)?.[1];
            if (code === 'ACTION_REDIRECT') {
              // This is a successful redirect, let it happen
              throw error;
            }
           } catch(e) {
             throw error;
           }
        } else {
          toast({
            title: 'An error occurred',
            description: error instanceof Error ? error.message : 'Please try again later.',
            variant: 'destructive',
          });
        }
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
                      <Input placeholder={`Task #${index + 1}`} {...field} className="text-base" />
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
          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} disabled={fields.length >= 5}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>

          <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto" disabled={isPending || !form.formState.isValid}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Generate My Plan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
