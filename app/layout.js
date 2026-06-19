import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "CareerDeck — AI Interview Prep Dossier Generator",
  description:
    "8 hours of research. Or 90 seconds. CareerDeck builds a 15-page interview prep dossier with real financials, competitor intel, and talking points.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen antialiased">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
