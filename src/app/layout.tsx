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
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Data Analytics for Critical Thinkers",
    description: "A statistics textbook by Gautam Sethi",
    type: "website",
    images: [
      {
        url: "/data-analytics.png",
        width: 512,
        height: 512,
        alt: "Data Analytics for Critical Thinkers",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Data Analytics for Critical Thinkers",
    description: "A statistics textbook by Gautam Sethi",
    images: ["/data-analytics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/chapter/welcome"
      appearance={{
        variables: {
          colorPrimary: '#003262', // Berkeley blue
          colorText: 'var(--foreground)',
          colorTextSecondary: 'var(--muted-text)',
          colorBackground: 'var(--card-bg)',
          colorInputBackground: 'var(--input-bg)',
          colorInputText: 'var(--foreground)',
          fontFamily: 'EB Garamond, serif',
          fontSize: '1rem',
          borderRadius: '0.5rem',
        },
        elements: {
          // Hide profile editing (name/avatar) - we use Supabase for profile data
          profileSection__profile: { display: 'none' },
          // Hide connected accounts since we only use email/password
          profileSection__connectedAccounts: { display: 'none' },
          // Style the modal/card
          card: {
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          },
          modalBackdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          // Form inputs
          formFieldInput: {
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
          },
        },
      }}
    >
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
