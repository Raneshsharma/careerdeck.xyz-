"use client";

import HeroSection from "@/components/sections/HeroSection";
import ProblemSolutionSection from "@/components/sections/ProblemSolutionSection";
import StepsSection from "@/components/sections/StepsSection";
import DossiersSection from "@/components/sections/DossiersSection";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <ProblemSolutionSection />
      <StepsSection />
      <DossiersSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
