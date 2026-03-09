import type { Metadata } from "next";
import { Cinzel, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const expressive = Cinzel({
  subsets: ["latin"],
  variable: "--font-expressive",
  weight: ["400", "500", "700"],
});

const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const utilitarian = Space_Mono({
  subsets: ["latin"],
  variable: "--font-utilitarian",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AI Agents Duel",
  description: "A split-screen interface for AI agents built around narrative friction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${expressive.variable} ${utilitarian.variable} ${ui.variable}`}>
        {children}
      </body>
    </html>
  );
}
