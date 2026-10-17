import React from 'react';
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Bookmark,
  Clock,
  CloudDownload,
  CloudUpload,
  Coffee,
  Eye,
  FileText,
  Headphones,
  LayoutGrid,
  List,
  PenLine,
  PenTool,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { DocumentMetadata, ThemeMode } from '../types';

interface LandingPageProps {
  recentDocs: DocumentMetadata[];
  theme: ThemeMode;
  onOpenPdfClick: () => void;
  onTrySamplePdf: () => void;
  onResumeDoc: (doc: DocumentMetadata) => void;
  onDeleteRecentDoc: (id: string, e: React.MouseEvent) => void;
  onToggleTheme: (newTheme?: ThemeMode) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onOpenShortcuts?: () => void;
}

function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return 'Recently';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  recentDocs,
  theme,
  onOpenPdfClick,
  onTrySamplePdf,
  onResumeDoc,
  onDeleteRecentDoc,
  onToggleTheme,
  onOpenLegal,
  onOpenShortcuts,
}) => {
  const [recentLayout, setRecentLayout] = React.useState<'grid' | 'list'>('grid');
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'sepia'
          ? 'bg-[#F6EFE6] text-[#241B14]'
          : theme === 'dark'
          ? 'bg-[#0B1120] text-[#F8FAFC]'
          : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NAVBAR: Royal Navy Bar (#1E3A8A) matching Reference
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-40 bg-[#1E3A8A] text-white border-b border-[#183269] h-[68px] sm:h-[72px] shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* LEFT: Blue rounded badge icon + StudyPDF title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              StudyPDF
            </span>
          </div>

          {/* CENTER: Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-white/90">
            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#recent"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Recent</span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#2563EB] text-white tabular-nums shadow-2xs">
                {recentDocs.length}
              </span>
            </a>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Shortcuts
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>Privacy</span>
            </button>
          </nav>

          {/* RIGHT: Theme Toggle (Coffee for Sepia, Sun for Light) + Try Sample + Open PDF */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'sepia' ? 'light' : 'sepia')}
              className="p-2 text-white/90 hover:text-white bg-blue-900/50 hover:bg-blue-900/70 border border-blue-400/30 rounded-lg transition-colors cursor-pointer"
              title={theme === 'sepia' ? 'Switch to Light Theme' : 'Switch to Sepia Paper Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'sepia' ? (
                <Coffee className="w-4 h-4 text-amber-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Try Sample Button (Translucent Navy with Sparkles) */}
            <button
              type="button"
              onClick={onTrySamplePdf}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Try Sample</span>
            </button>

            {/* Open a PDF Button (Crisp White with Upload Icon) */}
            <button
              type="button"
              onClick={onOpenPdfClick}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 sm:px-4 text-xs font-semibold text-[#1E3A8A] bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Open a PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CONTENT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO SECTION: Centered Headline, Badges, CTAs & Big Product Preview
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="text-center max-w-5xl mx-auto space-y-6 pt-2 sm:pt-4">
          {/* Badge: • PRIVATE • FAST • BROWSER-BASED */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-[#0284C7] bg-[#E0F2FE] border border-[#BAE6FD] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
            <span>• PRIVATE • FAST • BROWSER-BASED</span>
          </div>

          {/* Heading with Gradient Accent */}
          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight leading-[1.12] [text-wrap:balance] text-slate-900 sepia:text-[#171411]">
            Turn your PDFs into a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">
              better study space.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-[19px] text-slate-600 sepia:text-[#4A3B2C] max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
            Read, highlight, bookmark, take notes, and track your progress — directly in your browser.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onOpenPdfClick}
              className="h-11 px-6 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Open a PDF</span>
            </button>

            <button
              type="button"
              onClick={onTrySamplePdf}
              className="h-11 px-6 text-sm font-semibold text-[#2563EB] bg-white sepia:bg-[#FFFDF9] hover:bg-slate-50 border border-slate-200 sepia:border-[#E6DCD0] rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              <span>Try Sample PDF</span>
            </button>
          </div>

          {/* Privacy Trust Message */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-emerald-700 sepia:text-[#15803D] pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Your files stay in your browser. No account required.</span>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              REALISTIC PRODUCT PREVIEW MOCKUP (Full-Width Desktop)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="pt-6 sm:pt-8">
            <div className="relative rounded-2xl border border-slate-300/80 sepia:border-[#E6DCD0] bg-white sepia:bg-[#FFFDF9] shadow-2xl overflow-hidden text-left">
              {/* Mockup Toolbar: Deep Royal Navy matching reference */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1E3A8A] text-white text-xs border-b border-[#183269]">
                {/* Mac window dots + File name */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="font-semibold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
                    DBMS_Course_Notes_2026.pdf
                  </span>
                </div>

                {/* Center Page indicator pill */}
                <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] bg-blue-600 px-3 py-1 rounded-md text-white font-bold">
                  <span>Page 12</span>
                  <span className="opacity-70">/ 84</span>
                </div>

                {/* Right controls: Zoom badge + Study Mode button */}
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block font-mono text-[11px] bg-white/10 px-2.5 py-1 rounded text-white">
                    Zoom 125%
                  </span>
                  <span className="bg-[#059669] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs flex items-center gap-1">
                    Study Mode
                  </span>
                </div>
              </div>

              {/* Mockup 3-Pane Reader Body */}
              <div className="grid grid-cols-12 min-h-[380px] sm:min-h-[420px] bg-slate-100 sepia:bg-[#EFE7DC]">
                {/* LEFT PANE (Pages Sidebar) */}
                <div className="col-span-3 border-r border-slate-200 sepia:border-[#E6DCD0] p-3 flex flex-col gap-2.5 bg-slate-50/90 sepia:bg-[#FAF5ED]">
                  <div className="text-[11px] font-bold text-slate-500 sepia:text-[#8A7868] uppercase tracking-wider px-1">
                    PAGES
                  </div>

                  {/* Thumbnail 10 */}
                  <div className="p-2 rounded-lg bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 sepia:text-[#241B14]">
                      Page 10
                    </div>
                    <div className="text-[9px] text-slate-500 sepia:text-[#7A6B5C] truncate">
                      B-Trees
                    </div>
                  </div>

                  {/* Thumbnail 11 */}
                  <div className="p-2 rounded-lg bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 sepia:text-[#241B14]">
                      Page 11
                    </div>
                    <div className="text-[9px] text-slate-500 sepia:text-[#7A6B5C] truncate">
                      ACID Logs
                    </div>
                  </div>

                  {/* Thumbnail 12 (Active) */}
                  <div className="p-2 rounded-lg bg-blue-50/50 sepia:bg-[#FFFDF9] border-2 border-blue-600 sepia:border-[#8B6B4A] shadow-xs space-y-1">
                    <div className="text-[10px] font-bold text-blue-600 sepia:text-[#8B6B4A] flex items-center justify-between">
                      <span>Page 12</span>
                    </div>
                    <div className="text-[9px] font-medium text-slate-700 sepia:text-[#241B14] truncate">
                      Normalization
                    </div>
                  </div>
                </div>

                {/* CENTER PANE: Realistic Document Page */}
                <div className="col-span-6 p-4 sm:p-6 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-xl border border-slate-200 sepia:border-[#E2D5C3] p-5 space-y-3.5 shadow-md flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 sepia:text-[#8A7868] font-mono border-b border-slate-100 sepia:border-[#EDE4D5] pb-2">
                        <span className="font-semibold text-blue-600">CS 410 · DATABASE SYSTEMS</span>
                        <span>PAGE 12</span>
                      </div>

                      <div className="text-base sm:text-lg font-bold text-slate-900 sepia:text-[#171411] leading-snug">
                        Boyce-Codd Normal Form (BCNF)
                      </div>

                      <p className="text-xs text-slate-700 sepia:text-[#3D2F21] leading-relaxed">
                        A relation R is in BCNF if and only if for every non-trivial functional dependency{' '}
                        <mark className="bg-amber-200 text-amber-950 font-semibold px-1.5 py-0.5 rounded border border-amber-300">
                          X → Y
                        </mark>{' '}
                        , X is a superkey of R. This eliminates anomalies stemming from functional dependencies.
                      </p>
                    </div>

                    <div className="text-[9px] font-mono text-slate-400 sepia:text-[#8A7868] text-right pt-2 border-t border-slate-100 sepia:border-[#EDE4D5]">
                      StudyPDF · Page 12 of 84
                    </div>
                  </div>
                </div>

                {/* RIGHT PANE: Clean Reading Progress & Study Notes */}
                <div className="col-span-3 border-l border-slate-200 sepia:border-[#E6DCD0] p-3.5 flex flex-col justify-between bg-slate-50/90 sepia:bg-[#FAF5ED]">
                  <div className="space-y-3">
                    {/* Progress Card */}
                    <div className="p-3 bg-white sepia:bg-[#FFFDF9] rounded-xl border border-slate-200 sepia:border-[#E6DCD0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 sepia:text-[#241B14]">Reading Progress</span>
                        <span className="text-blue-600 font-mono">64%</span>
                      </div>
                      <div className="w-full bg-slate-100 sepia:bg-[#EFE6DA] h-2 rounded-full overflow-hidden">
                        <div className="w-[64%] h-full bg-gradient-to-r from-blue-600 to-teal-400 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 sepia:text-[#8A7868]">
                        <span>52 Read</span>
                        <span>29 Remaining</span>
                      </div>
                    </div>

                    {/* Active Notes */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 sepia:text-[#8A7868] tracking-wider uppercase">
                        ACTIVE NOTES (3)
                      </div>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-300/80 rounded-lg text-[10px] space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span>Page 12 · BCNF Key</span>
                          <span className="text-amber-700 font-normal">2m ago</span>
                        </div>
                        <div className="text-slate-700 leading-tight">
                          Normalization removes redundancy from relational databases. Superkey...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RECENT DOCUMENTS SECTION (#recent)
            Matches Screenshot (776).png with Structured Grid & List Views
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="recent" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 sepia:text-[#171411]">
                Good to see you back.
              </h2>
              <p className="text-sm text-slate-600 sepia:text-[#4A3B2C]">
                Continue your study sessions where you left off.
              </p>
            </div>

            {/* Layout switch controls (Grid / List) + Document count */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 sepia:bg-[#EFE6DA] text-blue-700 sepia:text-[#8B6B4A] border border-blue-200/60 sepia:border-[#E0D4C4]">
                {recentDocs.length} {recentDocs.length === 1 ? 'document' : 'documents'}
              </span>

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 sepia:bg-[#EFE6DA] border border-slate-200 sepia:border-[#E0D4C4]">
                <button
                  type="button"
                  onClick={() => setRecentLayout('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    recentLayout === 'grid'
                      ? 'bg-white sepia:bg-[#FFFDF9] text-blue-600 sepia:text-[#8B6B4A] shadow-xs'
                      : 'text-slate-500 sepia:text-[#7A6B5C] hover:text-slate-900'
                  }`}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRecentLayout('list')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    recentLayout === 'list'
                      ? 'bg-white sepia:bg-[#FFFDF9] text-blue-600 sepia:text-[#8B6B4A] shadow-xs'
                      : 'text-slate-500 sepia:text-[#7A6B5C] hover:text-slate-900'
                  }`}
                  title="List view"
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {recentDocs.length === 0 ? (
            /* Empty state */
            <div className="p-8 sm:p-10 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] text-center space-y-3.5 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 sepia:bg-[#EFE6DA] text-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">Your study desk is empty</h3>
                <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] max-w-sm mx-auto mt-1 leading-relaxed">
                  Open a PDF to start reading, taking page-linked notes, and highlighting key material.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenPdfClick}
                  className="h-10 px-5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Open PDF</span>
                </button>
              </div>
            </div>
          ) : recentLayout === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 pt-1">
              {recentDocs.map((doc) => {
                const highest = Math.max(doc.highestPageRead || 1, doc.currentPage || 1);
                const percent = doc.pageCount > 0 ? Math.round((highest / doc.pageCount) * 100) : 0;

                return (
                  <div
                    key={doc.id}
                    onClick={() => onResumeDoc(doc)}
                    className="group relative p-5 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200/90 sepia:border-[#E6DCD0] hover:border-blue-400 sepia:hover:border-[#8B6B4A] cursor-pointer flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 sepia:bg-[#EFE6DA] text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 sepia:bg-[#EFE6DA] text-slate-600 sepia:text-[#7A6B5C]">
                            {doc.fileName.toLowerCase().endsWith('.txt') || doc.fileName.toLowerCase().endsWith('.md') ? 'Notes' : 'PDF'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => onDeleteRecentDoc(doc.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove from history"
                          aria-label="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4
                          className="text-sm font-bold truncate text-slate-900 sepia:text-[#171411] group-hover:text-blue-600 transition-colors"
                          title={doc.title || doc.fileName}
                        >
                          {doc.title || doc.fileName}
                        </h4>
                        <p className="text-xs text-slate-500 sepia:text-[#7A6B5C] mt-0.5">
                          {doc.pageCount} pages · Currently on page {doc.currentPage}
                        </p>
                      </div>
                    </div>

                    {/* Progress Block */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 sepia:border-[#EFE6DA]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 sepia:text-[#7A6B5C]">Progress</span>
                        <span className="font-bold text-blue-600 font-mono tabular-nums">
                          {percent}% completed
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 sepia:bg-[#EFE6DA] h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="bg-gradient-to-r from-blue-600 to-teal-400 h-full rounded-full transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5 text-slate-500 sepia:text-[#7A6B5C]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTimeAgo(doc.lastOpened)}</span>
                        </span>
                        <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                          Continue reading <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white sepia:bg-[#FFFDF9] rounded-2xl border border-slate-200/90 sepia:border-[#E6DCD0] shadow-xs divide-y divide-slate-100 sepia:divide-[#EFE6DA] overflow-hidden">
              {recentDocs.map((doc) => {
                const highest = Math.max(doc.highestPageRead || 1, doc.currentPage || 1);
                const percent = doc.pageCount > 0 ? Math.round((highest / doc.pageCount) * 100) : 0;

                return (
                  <div
                    key={doc.id}
                    onClick={() => onResumeDoc(doc)}
                    className="group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 sepia:hover:bg-[#F6EFE6]/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 sepia:bg-[#EFE6DA] text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 sepia:text-[#171411] truncate group-hover:text-blue-600 transition-colors">
                            {doc.title || doc.fileName}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 sepia:bg-[#EFE6DA] text-slate-500 sepia:text-[#7A6B5C]">
                            {doc.fileName.toLowerCase().endsWith('.txt') || doc.fileName.toLowerCase().endsWith('.md') ? 'Notes' : 'PDF'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 sepia:text-[#7A6B5C] mt-0.5">
                          {doc.pageCount} pages · Page {doc.currentPage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-12 sm:pl-0">
                      {/* Progress */}
                      <div className="w-32 hidden md:block">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-400 sepia:text-[#8A7868]">Progress</span>
                          <span className="font-bold text-blue-600 font-mono">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 sepia:bg-[#EFE6DA] h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="bg-gradient-to-r from-blue-600 to-teal-400 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-slate-400 sepia:text-[#8A7868] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(doc.lastOpened)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Continue <ArrowRight className="w-3 h-3" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => onDeleteRecentDoc(doc.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-1"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FEATURES SECTION (#features)
            Matches Screenshot (777).png
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="features" className="space-y-6 pt-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 sepia:text-[#171411]">
              Engineered for focused academic studying
            </h2>
            <p className="text-sm text-slate-600 sepia:text-[#4A3B2C]">
              Everything you need to digest complex textbooks, research papers, and lecture slides without distractions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {/* 1. Read aloud */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Read aloud (Accessibility TTS)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Native browser speech engine reads pages and selected excerpts aloud with live sentence tracking and speed controls.
              </p>
            </div>

            {/* 2. Read comfortably */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Read comfortably
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Switch between Royal Blue, Warm Sepia, and Dark modes with distraction-free Study Mode.
              </p>
            </div>

            {/* 3. Search instantly */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Search instantly
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Fast full-text search across the entire document with live match counts and page jumps.
              </p>
            </div>

            {/* 4. Take smarter notes */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PenLine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Take smarter notes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Color-coded study cards pinned to exact pages. Edit, organize, and export anytime.
              </p>
            </div>

            {/* 5. Bookmark important pages */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-blue-600">
                Bookmark important pages
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Mark core formulas, exam topics, and chapters with colored tags for quick revision.
              </p>
            </div>

            {/* 6. Track study progress */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Track study progress
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Live completion percentages, pages read counters, and session history stored in browser.
              </p>
            </div>

            {/* 7. Keep everything private */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Keep everything private
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Zero servers, zero accounts, and zero cloud uploads. Your documents never leave your device.
              </p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HOW IT WORKS SECTION (#how-it-works)
            Matches Screenshot (779).png
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how-it-works" className="space-y-6 pt-4 border-t border-slate-200/80 sepia:border-[#E6DCD0]">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 sepia:text-[#171411]">
              How StudyPDF Works
            </h2>
            <p className="text-sm text-slate-600 sepia:text-[#4A3B2C]">
              A seamless three-step flow designed around privacy, speed, and exam retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <span className="text-base font-mono font-bold text-blue-500">
                  01
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Open any PDF document
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Drag and drop textbooks, syllabi, or lecture slides. Files are parsed 100% locally in browser memory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-base font-mono font-bold text-blue-500">
                  02
                </span>
              </div>
              <h3 className="text-base font-bold text-blue-600">
                Annotate and study deeply
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Highlight key passages, flag core definitions with bookmarks, and write organized study notes per page.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white sepia:bg-[#FFFDF9] border border-slate-200 sepia:border-[#E6DCD0] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CloudDownload className="w-5 h-5" />
                </div>
                <span className="text-base font-mono font-bold text-blue-500">
                  03
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 sepia:text-[#171411]">
                Track progress and export
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 sepia:text-[#4A3B2C] leading-relaxed">
                Your progress is remembered automatically. Export formatted Markdown or plain-text revision summaries.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER: Matches Screenshot (779).png
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-slate-200/80 sepia:border-[#E6DCD0] py-8 px-4 sm:px-6 bg-white/70 sepia:bg-[#FAF5ED]/80 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 sepia:text-[#7A6B5C]">
          <div className="flex items-center gap-2 font-semibold text-slate-700 sepia:text-[#241B14]">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span>StudyPDF</span>
            <span className="font-normal text-slate-400 sepia:text-[#8A7868]">
              — Private Browser-Based PDF Study Desk
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-blue-600 sepia:hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-blue-600 sepia:hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="hover:text-blue-600 sepia:hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Shortcuts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
