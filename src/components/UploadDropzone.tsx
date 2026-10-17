import React, { useRef, useState } from 'react';
import { FileText, AlertCircle, Loader2, X, Upload } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  loadingMessage?: string;
  errorMessage?: string | null;
  onClearError?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  isLoading,
  loadingMessage = 'Preparing your PDF...',
  errorMessage,
  onClearError,
  onClose,
  isModal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    onFileSelect(file);
  };

  const content = (
    <div className="w-full max-w-lg mx-auto">
      {errorMessage ? (
        <div className="p-8 rounded-2xl border border-red-200 sepia:border-red-300 dark:border-red-900/50 bg-white sepia:bg-[#FFFDF9] dark:bg-neutral-900 text-center space-y-4 shadow-xl animate-in fade-in duration-150">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 sepia:bg-red-100/60 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">
              We couldn't open this file
            </h3>
            <p className="text-xs text-slate-600 sepia:text-[#5C4C3E] dark:text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {errorMessage || 'The file may be corrupted, password protected, or invalid.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClearError) onClearError();
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Try Another Document
          </button>
        </div>
      ) : isLoading ? (
        <div className="p-10 rounded-2xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] text-center space-y-4 shadow-xl animate-in fade-in duration-150">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 sepia:bg-[#EFE6DA] dark:bg-[#2A231C] text-blue-600 sepia:text-[#2563EB] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 sepia:text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">{loadingMessage}</h3>
            <p className="text-xs text-slate-500 sepia:text-[#7A6B5C] dark:text-[#A8A29E] mt-1">Building your study space</p>
          </div>
          <div className="w-48 mx-auto bg-slate-100 sepia:bg-[#EFE6DA] dark:bg-[#2F271F] h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 sepia:bg-[#2563EB] dark:bg-white h-full w-2/3 rounded-full animate-pulse" />
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center space-y-4 bg-white sepia:bg-[#FFFDF9] dark:bg-slate-900 shadow-xl ${
            isDragging
              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
              : 'border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50/60 sepia:hover:bg-[#F6EFE6]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,.txt,.md,.text,text/plain,text/markdown"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 sepia:bg-[#EFE6DA] dark:bg-blue-950/60 text-blue-600 sepia:text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 sepia:text-[#241B14] dark:text-white tracking-tight">
              Drop your PDF or notes here
            </h3>
            <p className="text-xs text-slate-500 sepia:text-[#6B5B4D] dark:text-slate-400 mt-1">
              Supports PDF, TXT, and Markdown documents
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="h-10 px-5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              Choose Document
            </button>
          </div>

          <div className="pt-1 text-[11px] text-slate-400 sepia:text-[#8A7868]">
            PDF & text documents · Processed entirely in your browser (100% private)
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white rounded-lg cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
};
