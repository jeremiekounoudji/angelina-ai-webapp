import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased bg-[#212121] text-white font-sans">
        {children}
      </body>
    </html>
  );
}