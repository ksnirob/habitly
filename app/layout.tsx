import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { PwaProvider } from "@/components/pwa-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habitly",
  description: "Build better habits, one day at a time.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habitly"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system">
          <PwaProvider />
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
