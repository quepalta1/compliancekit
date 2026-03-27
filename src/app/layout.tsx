import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ComplianceKit – NIS2 & ISO 27001 Readiness",
  description:
    "Self-service compliance assessment, evidence tracking, and policy generation for European SMEs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", jakarta.variable)}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
