import React from 'react';
import { X, ShieldCheck, FileCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A]">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 sepia:text-[#1E724F]" />
            ) : (
              <FileCheck className="w-5 h-5 text-blue-600 sepia:text-[#8B6B4A]" />
            )}
            <h3 className="text-sm font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white hover:bg-slate-200/60 sepia:hover:bg-[#EAE8E3]/60 dark:hover:bg-[#332921] rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-600 sepia:text-[#5C4C3E] dark:text-[#B5ADA4] leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div className="p-3 bg-emerald-50 sepia:bg-[#E9F4EE] border border-emerald-200 sepia:border-[#A2D4B9] rounded-xl text-emerald-800 sepia:text-[#175C3F] font-medium">
                100% Client-Side Architecture. Your PDF documents, study notes, bookmarks, and highlights never leave your browser.
              </div>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">1. Zero Server Uploads</h4>
              <p>
                StudyPDF processes your documents locally using browser-based WebAssembly and JavaScript PDF rendering technologies (PDF.js). No files are uploaded, transmitted, or hosted on external servers or cloud endpoints.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">2. Local Storage & IndexedDB</h4>
              <p>
                Your notes, annotations, bookmarks, reading progress percentages, and recent document titles are stored exclusively in your browser's private local storage and IndexedDB. You can clear this data at any time via your browser settings or by removing documents from the recent list.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">3. No Trackers or Telemetry</h4>
              <p>
                StudyPDF does not run marketing pixels, behavioral analytics, session recorders, or third-party advertising scripts.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">4. Data Portability</h4>
              <p>
                You retain complete ownership of all created content. You can export your study notes and bookmarks at any time in standard Markdown (.md) or Plain Text (.txt) formats.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">1. Acceptance of Terms</h4>
              <p>
                By accessing and using StudyPDF, you agree to these Terms and Conditions. StudyPDF is provided as an open browser-based study toolkit.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">2. Permitted Use</h4>
              <p>
                You may use StudyPDF for personal, academic, and professional document reading, annotation, and study purposes. You are solely responsible for ensuring you have lawful access and intellectual property rights to any documents opened within your browser.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">3. Disclaimer of Warranty</h4>
              <p>
                The software is provided "as is", without warranty of any kind, express or implied. The developers assume no liability for local data loss resulting from browser cache evictions or storage constraints. We recommend periodically exporting critical study notes using the built-in Export feature.
              </p>

              <h4 className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white text-sm">4. Modifications</h4>
              <p>
                We reserve the right to refine or enhance StudyPDF at any time to deliver improved reading performance and accessibility.
              </p>
            </>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#201B16] border-t border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] text-right">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
