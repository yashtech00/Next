import type { Metadata } from "next";
import { Inter, Doto } from "next/font/google";
import "./globals.css";
import { OAuthTokenStore } from "./lib/oAuthstoretoken";
import Sidebar from "./components/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const doto = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  weight: ["100", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Next AI Builder",
  description: "AI-powered website and app generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${doto.variable}`}>
      <body>
        <Sidebar />
         <OAuthTokenStore />
        {children}
      </body>
    </html>
  );
}
