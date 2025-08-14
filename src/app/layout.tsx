import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Inter } from 'next/font/google';

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
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -10,
                backgroundImage: `url('https://images.unsplash.com/photo-1588382332194-2ce6de75f362?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(75%)',
            }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
