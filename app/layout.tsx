import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InstinctX - Hiring, Reimagined",
  description: "Elite global talent. Unmatched precision. A new standard for startups. AI-powered matching with 99% accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <ConditionalLayout>
        {children}
            </ConditionalLayout>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
