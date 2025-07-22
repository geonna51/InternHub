import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'InternHub | Effortless Internship Tracking',
  description: 'The all-in-one platform to track, analyze, and conquer your job search.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
