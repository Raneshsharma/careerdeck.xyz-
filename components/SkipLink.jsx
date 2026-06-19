"use client";

export default function SkipLink() {
  return (
    <a
      id="skip-link"
      href="/generate"
      className="fixed top-5 right-6 z-50 text-sm text-zinc-500 hover:text-amber-400 transition-colors opacity-0"
    >
      Skip story &rarr;
    </a>
  );
}
