import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "SnapX",
  description: "AI-powered receipts & documents vault",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* Navbar on all pages */}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
