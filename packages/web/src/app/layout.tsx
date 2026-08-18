import type { Metadata } from "next";
import AmplifyProvider from "@/components/AmplifyProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-display",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Uni-Verse — Messaging without borders",
        template: "%s · Uni-Verse",
    },
    description:
        "Real-time messaging that speaks every language. Chat, share files and GIFs, and translate conversations across the universe of languages.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "font-sans",
                geist.variable,
                geistMono.variable,
                spaceGrotesk.variable
            )}
        >
            <body
                className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
            >
                <AmplifyProvider>
                    <QueryProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </QueryProvider>
                </AmplifyProvider>
            </body>
        </html>
    );
}
