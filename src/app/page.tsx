import { Header } from '@/components/app/Header';
import TaskInputForm from '@/components/app/TaskInputForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Welcome to MingAI</CardTitle>
            <p className="text-muted-foreground pt-2">
              Start your journey to self-improvement. <br/> Enter up to 5 tasks you want to accomplish.
            </p>
          </CardHeader>
          <CardContent>
            <TaskInputForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
