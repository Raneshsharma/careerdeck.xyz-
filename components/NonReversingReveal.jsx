"use client";

import { useEffect, useRef } from "react";

export default function NonReversingReveal({ children, trigger, start, end, className = "", id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el || !el.parentElement) return;

    let st;
    try {
      const { gsap } = require("gsap");
      const { ScrollTrigger } = require("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      st = ScrollTrigger.create({
        trigger: trigger || el.parentElement,
        start: start || "top 85%",
        end: end || "top 30%",
        toggleActions: "play none none none",
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        },
      });
    } catch (e) {
      el.style.opacity = "1";
      el.style.transform = "none";
    }

    return () => { try { st?.kill(); } catch {} };
  }, [trigger, start, end]);

  return (
    <div ref={ref} id={id} className={`opacity-0 ${className}`} style={{ transform: "translateY(40px)" }}>
      {children}
    </div>
  );
}
