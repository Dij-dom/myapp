'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { LogIn, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/daily-review', label: 'Daily Review' },
];

export function Header({ withNav: showNavLinks = false }: { withNav?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const withNav = user && showNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        {withNav && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex flex-1 items-center justify-end gap-4">
          <ModeToggle />
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2" />
              Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
              <LogIn className="mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
