import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "CareerDeck — AI Interview Prep Dossier Generator",
  description:
    "Paste a company name, role, and job description → get a 15+ page interview prep dossier in minutes. Built for MBA students and early-career professionals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
