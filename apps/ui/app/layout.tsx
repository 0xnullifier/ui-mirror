import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // import font
import "../styles/globals.css";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "NetZero",
  description: "Proof of Solvency platform built on MINA Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // add font to className, also add antialiased and dark mode
    <html lang="en" className={`${GeistSans.className} antialiased bg-[#F8F9FA]`}>

      <body>
        {children}
      </body>
    </html>
  );
}