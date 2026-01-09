import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meeting Cost Calculator - Time is Money',
  description: 'Calculate the real-time cost of meetings based on attendee salaries and hourly rates. Make meetings count.',
  keywords: ['meeting cost', 'calculator', 'productivity', 'time management', 'business'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

