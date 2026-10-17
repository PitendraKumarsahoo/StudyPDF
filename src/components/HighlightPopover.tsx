import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, X, Volume2, Square } from 'lucide-react';
import { HighlightColor } from '../types';
import { ttsService } from '../utils/ttsService';

interface HighlightPopoverProps {
  position: { top: number; left: number; bottom?: number };
  selectedText: string;
  onHighlight: (color: HighlightColor) => void;
  onAddNote: (text: string) => void;
  onClose: () => void;
}

export const HighlightPopover: React.FC<HighlightPopoverProps> = ({
  position,
  selectedText,
  onHighlight,
  onAddNote,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech if popover closes
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        ttsService.stop();
      }
    };
  }, [isSpeaking]);

  const colors: { name: HighlightColor; label: string; bg: string; ring: string }[] = [
    { name: 'yellow', label: 'Warm Amber', bg: 'bg-[#F59E0B]', ring: 'hover:ring-[#D97706]' },
    { name: 'green', label: 'Emerald Green', bg: 'bg-[#10B981]', ring: 'hover:ring-[#059669]' },
    { name: 'blue', label: 'Sky Blue', bg: 'bg-[#3B82F6]', ring: 'hover:ring-[#2563EB]' },
    { name: 'pink', label: 'Rose Pink', bg: 'bg-[#EC4899]', ring: 'hover:ring-[#DB2777]' },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleToggleListen = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      ttsService.speakText(selectedText, {
        pitch: 1.18, // Cute, natural tone
        rate: 0.98,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // If selection is too close to top toolbar, position popover underneath the selection
  const showBelow = position.top < 80;
  const computedTop = showBelow
    ? (position.bottom ? position.bottom + 10 : position.top + 36)
    : Math.max(12, position.top - 48);

  // Clamp horizontal coordinate so popover never clips off viewport edges
  const maxLeft = typeof window !== 'undefined' ? window.innerWidth - 180 : 400;
  const clampedLeft = Math.max(180, Math.min(maxLeft, position.left));

  return (
    <div
      style={{
        top: `${computedTop}px`,
        left: `${clampedLeft}px`,
        transform: 'translateX(-50%)',
      }}
      className="highlight-popover-container fixed z-50 flex items-center gap-2 px-3.5 py-1.5 bg-[#0F172A]/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/80 text-xs animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/50 select-none cursor-default"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 4 Colored Swatches matching user image */}
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700">
        {colors.map((c) => (
          <button
            key={c.name}
            type="button"
            title={`Highlight in ${c.label}`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => onHighlight(c.name)}
            className={`w-5 h-5 rounded-full ${c.bg} transition-all duration-150 hover:scale-125 active:scale-95 focus-visible:outline-none focus-visible:ring-2 ring-offset-1 ring-offset-[#0F172A] ${c.ring} cursor-pointer shadow-sm`}
          />
        ))}
      </div>

      {/* + Note Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => onAddNote(selectedText)}
        className="flex items-center gap-1 px-2 py-1 text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors whitespace-nowrap cursor-pointer font-medium"
        title="Add note from selection"
      >
        <Plus className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
        <span>+ Note</span>
      </button>

      {/* Listen Button (speaks only this selected part with auto-stop and stop option) */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleToggleListen}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer font-medium ${
          isSpeaking
            ? 'bg-amber-400 text-slate-900 ring-1 ring-amber-300 font-semibold'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title={isSpeaking ? 'Stop Audio' : 'Listen to selected text (Cute Voice)'}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current text-slate-900 animate-pulse" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Listen</span>
          </>
        )}
      </button>

      {/* Copy Text Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors whitespace-nowrap cursor-pointer font-medium"
        title="Copy selected text"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span>Copy Text</span>
          </>
        )}
      </button>

      {/* Dismiss Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-0.5 cursor-pointer"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
