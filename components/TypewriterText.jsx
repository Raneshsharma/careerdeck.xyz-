"use client";

import { useState, useEffect, useRef } from "react";

const FULL_TEXT = "in 90 seconds.";
const TYPE_SPEED = 120;
const BACKSPACE_SPEED = 60;
const PAUSE_AFTER_TYPE = 3000;
const PAUSE_AFTER_BACKSPACE = 1200;

export default function TypewriterText() {
  const [display, setDisplay] = useState("");
  const idxRef = useRef(0);
  const phaseRef = useRef("typing");

  useEffect(() => {
    let timer;

    const tick = () => {
      if (phaseRef.current === "typing") {
        const next = idxRef.current + 1;
        idxRef.current = next;
        setDisplay(FULL_TEXT.slice(0, next));
        if (next >= FULL_TEXT.length) {
          phaseRef.current = "pausing";
          timer = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          timer = setTimeout(tick, TYPE_SPEED);
        }
      } else if (phaseRef.current === "pausing") {
        phaseRef.current = "backspacing";
        timer = setTimeout(tick, BACKSPACE_SPEED);
      } else if (phaseRef.current === "backspacing") {
        const next = idxRef.current - 1;
        idxRef.current = next;
        setDisplay(FULL_TEXT.slice(0, next));
        if (next <= 0) {
          phaseRef.current = "pause-before-type";
          timer = setTimeout(tick, PAUSE_AFTER_BACKSPACE);
        } else {
          timer = setTimeout(tick, BACKSPACE_SPEED);
        }
      } else if (phaseRef.current === "pause-before-type") {
        phaseRef.current = "typing";
        timer = setTimeout(tick, TYPE_SPEED);
      }
    };

    timer = setTimeout(tick, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="text-[#F28C28]">
      {display}
      <span className="inline-block w-[2px] h-[0.85em] bg-[#F28C28] ml-0.5 align-middle animate-pulse" />
    </span>
  );
}
