import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <ConditionalLayout>
        {children}
              </ConditionalLayout>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
