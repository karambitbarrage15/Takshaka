import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Takshaka - LLD Practice Platform",
  description: "Master Low-Level Design and machine coding interviews by practicing visually.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-full flex flex-col font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

