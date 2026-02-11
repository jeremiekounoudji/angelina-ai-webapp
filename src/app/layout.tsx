import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
import { Toaster } from 'react-hot-toast';
import { TranslationProvider } from "@/contexts/TranslationContext";

export const metadata: Metadata = {
  title: "AngelinaAI - WhatsApp Restaurant Management",
  description: "Revolutionize your restaurant management with AngelinaAI, a WhatsApp-based agent for orders, stock, delivery, and complaints.",
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