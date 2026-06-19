"use client";

import { useRef } from "react";

export default function ProgressBar() {
  const barRef = useRef(null);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-zinc-800">
      <div
        ref={barRef}
        id="progress-bar"
        className="h-full bg-amber-500 w-0 origin-left"
      />
    </div>
  );
}
