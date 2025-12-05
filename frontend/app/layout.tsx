import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Feed - NIT Rourkela",
  description: "Community platform for NIT Rourkela students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--color-bg-deep)] text-[var(--color-text)] min-h-screen antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <Sidebar />
            <div className="mainbody pl-0" style={{ paddingLeft: '5rem', paddingRight: '0rem' }}>
              <Suspense fallback={<div className="h-20" />}>
                <Navbar />
              </Suspense>
              <main className="px-4 max-w-7xl mx-auto pb-16 bg-deep">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

