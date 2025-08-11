import type React from "react";
import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google"; // UPDATED: Import Inter and Tajawal
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/components/language-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsAppFixedButton from "@/components/whatsapp-fixed-button";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"], // UPDATED: Weights for Inter
  variable: "--font-inter",
});

const tajawal = Tajawal({
  subsets: ["arabic"], // UPDATED: Subsets for Tajawal
  weight: ["400", "500", "700", "800"], // UPDATED: Weights for Tajawal
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "CTRLS-S - We build thinkers, not just coders.",
  description:
    "Youth-focused tech education program teaching problem-solving, soft skills, and digital literacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen antialiased",
          inter.variable,
          tajawal.variable
        )}
      >
        {" "}
        {/* UPDATED: Apply new font variables */}
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <Header className="z-20" />
            <main className="relative z-10 flex-grow">{children}</main>
            <Footer className="relative z-10" />
            <WhatsAppFixedButton />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
