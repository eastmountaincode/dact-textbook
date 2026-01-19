import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "katex/dist/katex.min.css";
import { DevModeProvider } from "@/providers/DevModeProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProfileProvider } from "@/providers/ProfileProvider";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Analytics for Critical Thinkers",
  description: "A statistics textbook by Gautam Sethi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${garamond.variable} font-serif antialiased bg-stone-50`}>
          <ThemeProvider>
            <ProfileProvider>
              <DevModeProvider>
                {children}
              </DevModeProvider>
            </ProfileProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
