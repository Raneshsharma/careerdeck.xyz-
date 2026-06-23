"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function NonReversingReveal({ children, trigger, start, end, className = "", id }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: trigger || el.parentElement,
      start: start || "top 85%",
      end: end || "top 30%",
      toggleActions: "play none none none",
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
      },
    });

    return () => st.kill();
  }, [trigger, start, end]);

  return (
      <div ref={ref} id={id} className={`opacity-0 ${className}`} style={{ transform: "translateY(40px)" }}>
      {children}
    </div>
  );
}
