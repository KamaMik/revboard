import { SidebarNav } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revenue Dashboard",
  description: "Dashboard per la gestione e analisi degli incassi giornalieri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-100 text-gray-900 dark:bg-gray-900 dark:text-white`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="revenue-dashboard-theme"
        >
          <div className="flex">
            <SidebarNav />
            <main className="min-h-screen flex-1 transition-all duration-300 ease-in-out">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
