import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen">
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center filter blur-sm brightness-75"
            style={{
              backgroundImage: `url('https://placehold.co/1000x1000.png')`,
            }}
            data-ai-hint="backyard garden"
          />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
