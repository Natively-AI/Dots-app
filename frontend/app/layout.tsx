import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import BetaBanner from "@/components/BetaBanner";
import ProfileOnboardingWrapper from "@/components/ProfileOnboardingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dots - Meet. Move. Motivate.",
  description: "Connect with fitness enthusiasts and discover local sports events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AuthProvider>
          <ProfileOnboardingWrapper>
            <BetaBanner />
            {children}
          </ProfileOnboardingWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
