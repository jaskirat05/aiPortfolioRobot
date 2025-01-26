import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({ 
  weight: '400',
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My Portfolio Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${vt323.className} h-full m-0 p-0 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
//heloo