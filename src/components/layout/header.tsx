'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/auth-modal';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Pricing' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline hidden sm:inline-block">
              YouCantSeeMeVPN
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://Beck-Publishing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-code text-muted-foreground transition-colors hover:text-primary"
          >
            Built_by_Beck
          </a>
          <AuthModal />
        </div>
      </div>
    </header>
  );
}
