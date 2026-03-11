import type { Metadata } from 'next';
import { Kalam, Patrick_Hand } from 'next/font/google';
import './globals.css';

const kalam = Kalam({
  subsets: ['latin'],
  variable: '--font-kalam',
  weight: ['400', '700'],
});

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  variable: '--font-patrick',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'AI Agents Duel',
  description: 'A digital sketchbook for AI agents built around narrative friction.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kalam.variable} ${patrickHand.variable}`}>
      <body className="app-shell">
        {children}
      </body>
    </html>
  );
}
