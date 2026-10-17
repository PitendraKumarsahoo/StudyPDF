import React from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  fileName: string;
  savedPage: number;
  totalPages: number;
  onContinue: () => void;
  onStartBeginning: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  fileName,
  savedPage,
  totalPages,
  onContinue,
  onStartBeginning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] shadow-2xl p-6 space-y-4 text-center ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 sepia:bg-[#EFE6DA] text-blue-600 sepia:text-[#2563EB] flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">
            Continue where you left off?
          </h3>
          <p className="text-xs text-slate-600 sepia:text-[#5C4C3E] dark:text-[#A8A29E] mt-1.5 leading-relaxed">
            You were reading <span className="font-semibold text-slate-900 sepia:text-[#241B14] dark:text-white">{fileName}</span> on{' '}
            <span className="font-mono font-semibold text-blue-600 sepia:text-[#8B6B4A]">
              page {savedPage} of {totalPages}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onStartBeginning}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold border border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-700 text-slate-700 sepia:text-[#241B14] dark:text-slate-200 hover:bg-slate-50 sepia:hover:bg-[#F6EFE6] dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>From start</span>
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-10 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
