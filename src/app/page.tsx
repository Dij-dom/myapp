'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { DailyPlan } from '@/lib/types';

import { Header } from '@/components/app/Header';
import TaskInputForm from '@/components/app/TaskInputForm';
import AddToPlan from '@/components/app/AddToPlan';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const savedPlan = localStorage.getItem(`dailyPlan_${user.uid}`);
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      }
    }
    setLoading(false);
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const hasPlan = plan && plan.tasks.length > 0;
  const canAddMore = hasPlan && plan.tasks.length < 5;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header withNav={true} />
      <main className="flex-1 flex items-center justify-center p-4">
        {canAddMore ? (
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold font-headline">Add to Today's Plan</CardTitle>
              <CardDescription className="text-muted-foreground pt-2">
                You can add up to {5 - plan!.tasks.length} more tasks to your plan for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddToPlan currentPlan={plan!} />
              <div className="text-center mt-4">
                 <Button variant="link" asChild>
                    <Link href="/dashboard">Or view your current plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold font-headline">Welcome to MingAI</CardTitle>
              <p className="text-muted-foreground pt-2">
                Start your journey to self-improvement. <br /> Enter up to 5 tasks you want to accomplish.
              </p>
            </CardHeader>
            <CardContent>
              <TaskInputForm />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
