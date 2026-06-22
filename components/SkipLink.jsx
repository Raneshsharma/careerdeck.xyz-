"use client";

import Link from "next/link";

export default function SkipLink() {
  return (
    <Link
      href="/auth"
      className="fixed top-5 right-6 z-50 text-sm text-zinc-500 hover:text-amber-400 transition-colors"
    >
      Get Started &rarr;
    </Link>
  );
}
