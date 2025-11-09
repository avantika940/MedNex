import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from '../components/Navigation';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedNex - AI-Powered Medical Symptom Checker",
  description: "Advanced AI-powered medical symptom checker using BioBERT and LLaMA for accurate disease prediction and symptom analysis.",
  keywords: "medical, symptom checker, AI, healthcare, diagnosis, BioBERT, machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-inter`}>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
