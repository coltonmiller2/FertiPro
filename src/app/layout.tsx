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
                backgroundImage: `url('https://i.imgur.com/7wkMw77.png')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
