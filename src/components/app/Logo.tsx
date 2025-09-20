import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <BrainCircuit className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
    </Link>
  );
}
