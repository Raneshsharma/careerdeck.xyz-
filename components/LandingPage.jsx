"use client";

import LandingHeader from "@/components/LandingHeader";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSolutionSection from "@/components/sections/ProblemSolutionSection";
import StepsSection from "@/components/sections/StepsSection";
import DossiersSection from "@/components/sections/DossiersSection";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";

export default function LandingPage() {
  return (
    <main className="relative bg-[#030712] text-[#F1F5F9] min-h-screen overflow-x-hidden font-sans">
      <LandingHeader />
      <HeroSection />
      <ProblemSolutionSection />
      <StepsSection />
      <DossiersSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
