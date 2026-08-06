import type { Metadata } from "next";
import { playfair, inter } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lexora Academy — English Language School in Yerevan",
  description:
    "Small classes, AI-assisted feedback and instructors who care about your progress — from your first words to your IELTS band score.",
  icons: {
    icon: "/images/lexora-mark.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
