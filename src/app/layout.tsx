import VisitorTracker from "@/components/visitor-tracker";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NavyGoal - Achieve your hard goals",
  description: "Track your progress with beautiful charts and insights to stay motivated on your journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <VisitorTracker />
      </body>
    </html>
  );
}
