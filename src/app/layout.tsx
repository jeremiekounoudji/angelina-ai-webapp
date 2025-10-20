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
    <html lang="en" className="ligth">
      <body className="antialiased bg-gray-100 text-text-primary font-sans">
        <TranslationProvider>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
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