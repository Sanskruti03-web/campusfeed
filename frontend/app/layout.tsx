import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import SocketStatus from "@/components/SocketStatus";
import FeedbackButton from "@/components/FeedbackButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Campus Feed - NIT Rourkela",
  description: "Community platform for NIT Rourkela students",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[var(--color-bg-deep)] text-[var(--color-text)] min-h-screen antialiased transition-colors duration-300`} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <Suspense fallback={<div className="hidden md:flex flex-col w-20 h-screen sticky top-0" />}>
                <Sidebar />
              </Suspense>
              <Suspense fallback={null}>
                <MobileNav />
              </Suspense>
              <div
                className="mainbody pb-20 md:pb-0 min-h-screen flex flex-col transition-[padding] duration-300"
                style={{ paddingLeft: 'var(--sidebar-width, 0px)' }}
              >
                <Suspense fallback={<div className="h-20" />}>
                  <div className="hidden md:block">
                    <Navbar />
                  </div>
                </Suspense>
                <main className="px-4 max-w-7xl mx-auto w-full pt-4 md:pt-0">
                  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-[var(--color-text-muted)]">Loading...</div>}>
                    {children}
                  </Suspense>
                </main>
                <FeedbackButton />
                <SocketStatus />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

