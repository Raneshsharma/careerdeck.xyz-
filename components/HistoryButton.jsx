"use client";

import { useState } from "react";
import HistorySidebar from "@/components/HistorySidebar";

export default function HistoryButton({ onSelect, activeId, onDelete, sidebarVersion }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
        aria-label="Open history"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Past dossiers">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-[#0F172A]">Past Dossiers</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100" aria-label="Close">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              <HistorySidebar
                key={sidebarVersion}
                onSelect={(id) => { onSelect(id); setOpen(false); }}
                activeId={activeId}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
