import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
import { Toaster } from 'react-hot-toast';
import { TranslationProvider } from "@/contexts/TranslationContext";

export const metadata: Metadata = {
  title: "Aangelina AI - Automatic WhatsApp Status Posting for Businesses",
  description: "Schedule and automate your WhatsApp status posts for your business. Aangelina AI handles your daily status publishing so you can focus on growing your business.",
  icons: {
    icon: '/angelina-logo-with-bg.png',
    apple: '/angelina-logo-with-bg.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased bg-white text-gray-900 font-sans">
        <TranslationProvider>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#328E6E',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </TranslationProvider>
      </body>
    </html>
  );
}