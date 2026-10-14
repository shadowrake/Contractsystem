import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
// @ts-expect-error -- Global CSS is handled by Next.js at build time.
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "herman kristiansen Kontraktsystem",
  description: "Dette er kontraktsystemet til herman kristiansen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <Toaster position="top-right" richColors expand closeButton></Toaster>
      </body>
    </html>
  );
}
