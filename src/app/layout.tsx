import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Alegreya } from 'next/font/google';

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});


export const metadata: Metadata = {
  title: 'Backyard Bounty',
  description: 'Backyard Fertilization Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${alegreya.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
