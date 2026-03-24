import type { Metadata } from "next";
import AmplifyProvider from "@/components/AmplifyProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uni-Verse",
  description: "Connect with your university community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
