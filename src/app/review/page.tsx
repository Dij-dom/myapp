import { Suspense } from 'react';
import SuggestionReview from '@/components/app/SuggestionReview';
import { Header } from '@/components/app/Header';
import { LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function ReviewPage({ searchParams }: { searchParams: { data?: string } }) {
  const data = searchParams.data;

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No suggestion data was provided. Please go back and enter your tasks again.
        </AlertDescription>
      </Alert>
    );
  }

  try {
    const refinedData = JSON.parse(decodeURIComponent(data));
    return <SuggestionReview initialData={refinedData} />;
  } catch (error) {
    console.error("Failed to parse suggestion data:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not read suggestion data. It might be corrupted. Please try again.
        </AlertDescription>
      </Alert>
    );
  }
}

export default function Page({ searchParams }: { searchParams: { data?: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Review Your Plan</CardTitle>
            <p className="text-muted-foreground pt-2">
              The AI has created micro-tasks for your goals. Approve the ones you like, or reject the ones you don't. <br /> Use swipe or arrow keys to review each task.
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>}>
              <ReviewPage searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
