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
                backgroundImage: `url('https://i.ibb.co/hZVHXwK/background.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(70%) blur(4px)',
            }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
