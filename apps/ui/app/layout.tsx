import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // import font
import "../styles/globals.css";
import { Footer } from "@/components/footer";
import { CustodianDataWrapper } from "@/components/CustodianDataWrapper";
import { Suspense } from "react";
import { Toaster } from "@/components/Toaster";

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
        <Toaster />
        <Suspense fallback={<div>loading...</div>}>
          <CustodianDataWrapper>
            {children}
          </CustodianDataWrapper>
        </Suspense>
      </body>
    </html >
  );
}