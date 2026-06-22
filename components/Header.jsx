"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      id="site-header"
      className="fixed top-0 left-0 right-0 z-40 translate-y-0"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16 border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-md rounded-b-2xl px-6">
          <Link href="/" className="flex items-center gap-2 text-zinc-100 font-semibold text-lg">
            <span>&#x1F3AF;</span>
            <span>CareerDeck</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth"
              className="text-sm px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all duration-200"
            >
              Generate
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
