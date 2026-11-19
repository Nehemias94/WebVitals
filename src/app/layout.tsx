import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

// next/font auto-hospeda la fuente y evita CLS por cambio de tipografía.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ultramarinos La Ceiba", template: "%s · La Ceiba" },
  description: "Tienda en línea construida con Next.js que consume una API REST de Laravel + Stripe.",
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <WebVitals />
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
          © Ultramarinos La Ceiba
        </footer>
      </body>
    </html>
  );
}
