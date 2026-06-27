"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOUR_STEPS = [
  { title: "Your Dashboard", text: "This is where you create interview-prep dossiers. Pick a dossier type from the tabs, fill in the company or role details, and hit Generate.", selector: "[data-tour='form']" },
  { title: "Past Dossiers", text: "All your previously generated dossiers live here. Click any to view it again, or delete ones you no longer need. On mobile, tap the History button.", selector: "[data-tour='history']" },
  { title: "Your Profile", text: "Tap here to see your plan, usage stats, manage your account, or sign out. The counter shows how many dossiers you have left this month.", selector: "[data-tour='user-menu']" },
  { title: "You're All Set!", text: "Generate your first dossier to see how CareerDeck works. Your first three are free every month. Ready to impress in your next interview?", selector: null },
];

const STORAGE_KEY = "careerdeck_tour_completed";

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const complete = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  const positionTooltip = useCallback(() => {
    if (currentStep.selector) {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        const tw = tooltipRef.current?.offsetWidth || 280;
        const th = tooltipRef.current?.offsetHeight || 160;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = rect.left + rect.width / 2 - tw / 2;
        let top = rect.bottom + 16;

        if (left < 16) left = 16;
        if (left + tw > vw - 16) left = vw - tw - 16;

        if (top + th > vh - 16 || rect.bottom > vh * 0.7) {
          top = rect.top - th - 16;
          if (top < 16) top = vh / 2 - th / 2;
        }

        setTooltipPos({ top, left });
        el.style.position = "relative";
        el.style.zIndex = "60";
        el.style.boxShadow = "0 0 0 4px #F28C28, 0 0 40px rgba(242,140,40,0.3)";
        el.style.borderRadius = "8px";
        el.style.transition = "box-shadow 0.3s ease";

        return () => {
          el.style.position = "";
          el.style.zIndex = "";
          el.style.boxShadow = "";
          el.style.borderRadius = "";
        };
      }
    }

    const tw = tooltipRef.current?.offsetWidth || 280;
    setTooltipPos({
      top: window.innerHeight / 2 - 100,
      left: window.innerWidth / 2 - tw / 2,
    });
    return () => {};
  }, [currentStep.selector]);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      const cleanup = positionTooltip();
      setVisible(true);
      return cleanup;
    }, 200);
    return () => clearTimeout(t);
  }, [step, positionTooltip]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") complete();
      if (e.key === "ArrowRight" && !isLast) setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [step, isLast, complete]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={complete} />

      <div
        ref={tooltipRef}
        className={`absolute z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl p-5 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <button
          onClick={complete}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Skip tour"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-1 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "bg-brand-500 w-6" : "bg-gray-200 w-1.5"}`} />
          ))}
        </div>

        <h3 className="text-lg font-bold text-[#0F172A] mb-1">{currentStep.title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed mb-5">{currentStep.text}</p>

        <div className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
                Back
              </button>
            )}
          </div>
          <button
            onClick={() => (isLast ? complete() : setStep((s) => s + 1))}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-[#0F172A] text-sm font-bold transition-all duration-200 min-h-[44px]"
          >
            {isLast ? "Got it!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowTour() {
  try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
}
