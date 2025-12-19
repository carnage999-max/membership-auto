import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/Footer";
import MarketingNav from "./components/MarketingNav";
import { AuthProvider } from "../lib/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Membership Auto - Never Pay for Car Repairs Again",
  description:
    "Join the world's first subscription-based vehicle service & repair club. One low monthly fee. Zero surprise bills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <AuthProvider>
        <MarketingNav />

          {children}
          
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
