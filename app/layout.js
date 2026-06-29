import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import SessionProvider from "@/components/SessionProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://careerdeck.xyz";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CareerDeck — Free AI Interview Prep Tool for MBA & Students | India",
    template: "%s | CareerDeck",
  },
  description:
    "Prepare for interviews in 90 seconds. CareerDeck generates AI-powered interview dossiers with company research, competitor analysis, and smart questions. Built for MBA students, graduates, and job seekers in India.",
  keywords: [
    "interview preparation", "AI interview prep", "MBA interview preparation", "placement preparation",
    "campus placement", "company research tool", "job interview questions", "career preparation India",
    "interview dossier", "AI career tool", "free interview prep", "student interview preparation"
  ],
  authors: [{ name: "CareerDeck" }],
  creator: "CareerDeck",
  publisher: "CareerDeck",
  formatDetection: { telephone: false },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "CareerDeck",
    title: "CareerDeck — Free AI Interview Prep Tool for Students | India",
    description: "Prepare for interviews in 90 seconds. AI-powered dossiers with company research, salary insights, and smart questions.",
    images: [{ url: `${SITE_URL}/logo.png`, width: 180, height: 120, alt: "CareerDeck" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerDeck — Free AI Interview Prep",
    description: "AI-powered interview dossiers in 90 seconds. Built for Indian students. Free tier available.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-SXHE8Y3N91";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {GA_ID && (
        <>
          <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "CareerDeck",
          url: SITE_URL,
          description: "AI-powered interview preparation tool that generates company research dossiers for MBA students and job seekers in India.",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            description: "Free tier with 3 dossiers per month",
          },
          author: { "@type": "Organization", name: "CareerDeck", url: SITE_URL, sameAs: [
            "https://www.linkedin.com/company/careerdeck",
            "https://twitter.com/careerdeckhq",
            "https://www.instagram.com/careerdeck"
          ]},
          inLanguage: ["en", "hi"],
          countriesSupported: "IN",
          keywords: "interview preparation, MBA, placement, career, company research, AI, India",
        })}
      </Script>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              error: {
                style: { background: "#DC2626", color: "#fff", fontSize: "14px" },
                iconTheme: { primary: "#fff", secondary: "#DC2626" },
                duration: 4000,
              },
            }}
          />
          {children}
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
