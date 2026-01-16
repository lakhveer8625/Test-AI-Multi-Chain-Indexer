import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../lib/apollo-provider";
import Header from "../components/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MultiScan | Multi-Chain Explorer",
  description: "Advanced analytics for multi-chain event data - explore blocks, transactions, and events across multiple EVM-compatible chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="antialiased selection:bg-blue-100 selection:text-blue-900 font-sans"
      >
        <Providers>
          <div className="flex flex-col min-h-screen bg-zinc-50/50">
            <Header />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
