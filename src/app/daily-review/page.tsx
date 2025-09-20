import { Header } from '@/components/app/Header';
import DailyReviewView from '@/components/app/DailyReviewView';

export default function DailyReviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header withNav={true} />
      <main className="flex-1 container mx-auto p-4 sm:p-8">
        <DailyReviewView />
      </main>
    </div>
  );
}
