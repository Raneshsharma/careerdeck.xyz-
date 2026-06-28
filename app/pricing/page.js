"use client";

import LandingHeader from "@/components/LandingHeader";
import PricingSection from "@/components/sections/PricingSection";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LandingHeader />
      <PricingSection />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Is CareerDeck free for students?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! CareerDeck offers a free tier with 3 AI-generated interview dossiers per month. No credit card required." } },
            { "@type": "Question", "name": "How many dossiers can I generate per month?", "acceptedAnswer": { "@type": "Answer", "text": "Free users get 3 dossiers/month. Pro subscribers (₹149/month) get 20 dossiers/month. Pro Annual (₹1,199/year) also gets 20/month at ₹99/month effective rate." } },
            { "@type": "Question", "name": "What does a CareerDeck dossier include?", "acceptedAnswer": { "@type": "Answer", "text": "Each dossier includes company overview, financial analysis, competitor landscape, interview questions, talking points, SWOT analysis, and role-specific insights. Generated in under 90 seconds using AI and real-time research." } },
            { "@type": "Question", "name": "What subscription plans does CareerDeck offer?", "acceptedAnswer": { "@type": "Answer", "text": "CareerDeck offers Free (3 dossiers/month), Pro Monthly (₹149/mo - 20 dossiers), and Pro Annual (₹1,199/yr - 20 dossiers/month at ₹99/mo effective). All plans include all 4 dossier types with Wikipedia and multi-source research." } },
            { "@type": "Question", "name": "Can I cancel my Pro subscription anytime?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can cancel anytime. There is no lock-in period. Pro Annual subscribers can cancel but the plan remains active until the year ends. We offer a 3-day money-back guarantee." } },
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "CareerDeck Pro",
          "description": "AI-powered interview preparation dossier generator for MBA students and job seekers",
          "offers": [
            { "@type": "Offer", "price": "0", "priceCurrency": "INR", "name": "Free Plan", "description": "3 dossiers per month" },
            { "@type": "Offer", "price": "149", "priceCurrency": "INR", "name": "Pro Monthly", "description": "20 dossiers per month, PDF export, priority speed" },
            { "@type": "Offer", "price": "1199", "priceCurrency": "INR", "name": "Pro Annual", "description": "20 dossiers per month, ₹99/mo effective, save ₹600 vs monthly" }
          ]
        }
      ]) }} />
    </div>
  );
}
