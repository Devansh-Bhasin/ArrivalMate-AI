import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArrivalMate AI",
  description:
    "AI-powered first-30-days planning for newcomers and international students arriving in British Columbia, Canada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--bg)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
