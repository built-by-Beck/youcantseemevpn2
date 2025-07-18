import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/components/auth/auth-modal';

export const metadata: Metadata = {
  title: 'YouCantSeeMeVPN',
  description: 'The most secure VPN on the planet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AuthModalProvider>
            <div
              className={cn('min-h-screen bg-background font-body antialiased')}
            >
              <Header />
              <main className="flex-1">{children}</main>
              <Toaster />
            </div>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
