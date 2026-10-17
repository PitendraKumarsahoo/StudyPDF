import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronRight,
  Download,
  Edit2,
  FileText,
  Highlighter,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  Bookmark as BookmarkType,
  DocumentMetadata,
  Highlight,
  HighlightColor,
  Note,
} from '../types';
import { exportNotesToMarkdown, exportNotesToText } from '../utils/exportUtils';

interface StudySidebarProps {
  metadata: DocumentMetadata;
  currentPage: number;
  bookmarks: BookmarkType[];
  notes: Note[];
  highlights: Highlight[];
  onAddBookmark: (page: number, title?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onRenameBookmark: (id: string, newTitle: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, content: string, color?: Note['color']) => void;
  onDeleteNote: (id: string) => void;
  onDeleteHighlight: (id: string) => void;
  onJumpToPage: (pageNumber: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'notes' | 'bookmarks' | 'highlights' | 'progress';

export const StudySidebar: React.FC<StudySidebarProps> = ({
  metadata,
  currentPage,
  bookmarks,
  notes,
  highlights,
  onAddBookmark,
  onRemoveBookmark,
  onRenameBookmark,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onDeleteHighlight,
  onJumpToPage,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePage, setNewNotePage] = useState(currentPage);
  const [newNoteColor, setNewNoteColor] = useState<Note['color']>('default');

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingBookmarkTitle, setEditingBookmarkTitle] = useState('');

  if (!isOpen) return null;

  const highestRead = Math.max(metadata.highestPageRead || 1, currentPage);
  const progressPercent = metadata.pageCount > 0 ? Math.round((highestRead / metadata.pageCount) * 100) : 0;
  const remainingPages = Math.max(0, metadata.pageCount - highestRead);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    onAddNote({
      docId: metadata.id,
      page: newNotePage,
      content: newNoteContent.trim(),
      color: newNoteColor,
    });

    setNewNoteContent('');
    setIsCreatingNote(false);
  };

  const handleStartEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleSaveEditNote = (id: string) => {
    if (editingNoteContent.trim()) {
      onUpdateNote(id, editingNoteContent.trim());
    }
    setEditingNoteId(null);
  };

  const handleStartEditBookmark = (bm: BookmarkType) => {
    setEditingBookmarkId(bm.id);
    setEditingBookmarkTitle(bm.title);
  };

  const handleSaveEditBookmark = (id: string) => {
    if (editingBookmarkTitle.trim()) {
      onRenameBookmark(id, editingBookmarkTitle.trim());
    }
    setEditingBookmarkId(null);
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.page === currentPage);

  return (
    <aside className="w-80 h-full border-l border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800 bg-slate-50/90 sepia:bg-[#FAF5ED] dark:bg-slate-900 flex flex-col shrink-0 z-20 transition-all select-none shadow-sm">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800 bg-white sepia:bg-[#FFFDF9] dark:bg-slate-900">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 sepia:bg-[#EFE6DA] dark:bg-slate-800 rounded-lg border border-slate-200 sepia:border-[#E0D4C4] dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 sepia:text-[#5C4C3E] dark:text-slate-300 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white'
            }`}
          >
            Notes ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 sepia:text-[#5C4C3E] dark:text-slate-300 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white'
            }`}
          >
            Bookmarks ({bookmarks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'highlights'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 sepia:text-[#5C4C3E] dark:text-slate-300 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white'
            }`}
          >
            Highlights ({highlights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 sepia:text-[#5C4C3E] dark:text-slate-300 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white'
            }`}
          >
            Info
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 sepia:hover:bg-[#EFE6DA] dark:hover:bg-slate-800 rounded-lg transition-colors ml-2 cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ===================== TAB: NOTES ===================== */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Action bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setNewNotePage(currentPage);
                  setIsCreatingNote(true);
                }}
                className="flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>

              {notes.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      exportNotesToMarkdown(
                        metadata.title,
                        metadata.fileName,
                        notes,
                        bookmarks,
                        highlights
                      )
                    }
                    title="Export as Markdown (.md)"
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 sepia:text-[#241B14] dark:text-[#F7F7F5] bg-white sepia:bg-[#FFFDF9] dark:bg-[#281F1A] hover:bg-slate-50 sepia:hover:bg-[#F6EFE6] rounded-md border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>.md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      exportNotesToText(
                        metadata.title,
                        metadata.fileName,
                        notes,
                        bookmarks,
                        highlights
                      )
                    }
                    title="Export as Plain Text (.txt)"
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 sepia:text-[#241B14] dark:text-[#F7F7F5] bg-white sepia:bg-[#FFFDF9] dark:bg-[#281F1A] hover:bg-slate-50 sepia:hover:bg-[#F6EFE6] rounded-md border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>.txt</span>
                  </button>
                </div>
              )}
            </div>

            {/* Note Creation Form */}
            {isCreatingNote && (
              <form
                onSubmit={handleCreateNoteSubmit}
                className="p-3 bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] space-y-2.5 shadow-xs animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">Add Note</span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] text-slate-500 sepia:text-[#8A7868]">Page:</label>
                    <input
                      type="number"
                      min={1}
                      max={metadata.pageCount}
                      value={newNotePage}
                      onChange={(e) => setNewNotePage(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 px-1.5 py-0.5 text-xs bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] rounded text-slate-900 sepia:text-[#241B14] text-center font-mono font-bold"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record your observation or formula..."
                  autoFocus
                  className="w-full p-2 text-xs bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] rounded-lg text-slate-900 sepia:text-[#241B14] dark:text-white placeholder-slate-400 sepia:placeholder-[#8A7868] focus:outline-none focus:border-blue-600 sepia:focus:border-[#8B6B4A] focus:ring-1 focus:ring-blue-500 sepia:focus:ring-[#8B6B4A] resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {(['default', 'amber', 'blue', 'emerald'] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewNoteColor(color)}
                        className={`w-4 h-4 rounded-full border ${
                          color === 'default'
                            ? 'bg-[#8B6B4A]'
                            : color === 'amber'
                            ? 'bg-[#F4D77D]'
                            : color === 'blue'
                            ? 'bg-sky-400'
                            : 'bg-emerald-400'
                        } ${newNoteColor === color ? 'ring-2 ring-blue-600 sepia:ring-[#8B6B4A] dark:ring-white ring-offset-1' : ''}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNote(false)}
                      className="px-2 py-1 text-xs text-slate-500 sepia:text-[#7A6B5C] hover:text-slate-900 sepia:hover:text-[#241B14] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notes List */}
            {notes.length === 0 && !isCreatingNote ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] flex items-center justify-center text-blue-600 sepia:text-[#8B6B4A]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-white mb-1">No notes yet</h4>
                <p className="text-[11px] text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585] max-w-[200px] mx-auto leading-relaxed">
                  Add notes while reading to remember key formulas and concepts.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notes
                  .slice()
                  .sort((a, b) => a.page - b.page || b.createdAt - a.createdAt)
                  .map((note) => {
                    const isEditing = editingNoteId === note.id;

                    return (
                      <div
                        key={note.id}
                        className="group p-3 bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] hover:border-blue-400 sepia:hover:border-[#8B6B4A]/60 shadow-2xs transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onJumpToPage(note.page)}
                            className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 sepia:text-[#8B6B4A] hover:underline cursor-pointer"
                            title="Jump to page"
                          >
                            <span>Page {note.page}</span>
                            <ChevronRight className="w-3 h-3 text-blue-600 sepia:text-[#8B6B4A]" />
                          </button>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleStartEditNote(note)}
                              className="p-1 text-slate-400 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white rounded hover:bg-slate-100 sepia:hover:bg-[#F6EFE6] dark:hover:bg-[#281F1A] cursor-pointer"
                              title="Edit note"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteNote(note.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              className="w-full p-2 text-xs bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A] text-slate-900 sepia:text-[#241B14] dark:text-[#F7F7F5] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] rounded-lg focus:outline-none focus:border-blue-600 sepia:focus:border-[#8B6B4A]"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-0.5 text-xs text-slate-500 sepia:text-[#7A6B5C] dark:text-[#A8A29E] hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditNote(note.id)}
                                className="px-2.5 py-0.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-2xs"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-800 sepia:text-[#241B14] dark:text-[#F7F7F5] whitespace-pre-wrap leading-relaxed select-text">
                            {note.content}
                          </p>
                        )}

                        <div className="text-[10px] text-slate-400 sepia:text-[#8A7868]">
                          {new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: BOOKMARKS ===================== */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onAddBookmark(currentPage, `Page ${currentPage}`)}
                disabled={isCurrentPageBookmarked}
                className={`flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-[8px] transition-all shadow-xs cursor-pointer ${
                  isCurrentPageBookmarked
                    ? 'bg-slate-100 sepia:bg-[#EFE6DA] text-slate-400 dark:bg-slate-800 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {isCurrentPageBookmarked ? 'Page Bookmarked' : `Bookmark Page ${currentPage}`}
                </span>
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] flex items-center justify-center text-blue-600 sepia:text-[#8B6B4A]">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-white mb-1">No bookmarks yet</h4>
                <p className="text-[11px] text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585] max-w-[200px] mx-auto leading-relaxed">
                  Bookmark important pages while studying to jump back quickly.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks
                  .slice()
                  .sort((a, b) => a.page - b.page)
                  .map((bm) => {
                    const isEditing = editingBookmarkId === bm.id;

                    return (
                      <div
                        key={bm.id}
                        className="group flex items-center justify-between p-2.5 bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] hover:border-blue-400 sepia:hover:border-[#8B6B4A]/60 transition-all shadow-2xs"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingBookmarkTitle}
                              onChange={(e) => setEditingBookmarkTitle(e.target.value)}
                              autoFocus
                              className="flex-1 px-2 py-0.5 text-xs bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A] text-slate-900 sepia:text-[#241B14] dark:text-[#F7F7F5] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] rounded focus:outline-none focus:border-blue-600 sepia:focus:border-[#8B6B4A]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditBookmark(bm.id)}
                              className="p-1 text-blue-600 sepia:text-[#8B6B4A] hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onJumpToPage(bm.page)}
                            className="flex items-center gap-2 text-left truncate flex-1 hover:text-blue-600 sepia:hover:text-[#8B6B4A] cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-blue-600 sepia:text-[#8B6B4A] fill-current shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-white truncate">
                                {bm.title}
                              </div>
                              <div className="text-[10px] font-mono text-blue-600 sepia:text-[#8B6B4A] font-semibold tabular-nums">
                                Page {bm.page}
                              </div>
                            </div>
                          </button>
                        )}

                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEditBookmark(bm)}
                              className="p-1 text-slate-400 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white rounded hover:bg-slate-100 sepia:hover:bg-[#F6EFE6] dark:hover:bg-[#281F1A] cursor-pointer"
                              title="Rename bookmark"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveBookmark(bm.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: HIGHLIGHTS ===================== */}
        {activeTab === 'highlights' && (
          <div className="space-y-3">
            {highlights.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] flex items-center justify-center text-blue-600 sepia:text-[#8B6B4A]">
                  <Highlighter className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-white mb-1">No highlights yet</h4>
                <p className="text-[11px] text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585] max-w-[200px] mx-auto leading-relaxed">
                  Select text in the PDF document to highlight key terms and concepts.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {highlights
                  .slice()
                  .sort((a, b) => a.page - b.page || b.createdAt - a.createdAt)
                  .map((hl) => {
                    const colorBadge =
                      hl.color === 'yellow'
                        ? 'bg-[#F4D77D]'
                        : hl.color === 'green'
                        ? 'bg-emerald-400'
                        : hl.color === 'blue'
                        ? 'bg-sky-400'
                        : 'bg-pink-400';

                    return (
                      <div
                        key={hl.id}
                        className="group p-2.5 bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] hover:border-blue-400 sepia:hover:border-[#8B6B4A]/60 transition-all space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${colorBadge}`} />
                            <button
                              type="button"
                              onClick={() => onJumpToPage(hl.page)}
                              className="font-mono font-bold text-blue-600 sepia:text-[#8B6B4A] hover:underline cursor-pointer"
                            >
                              Page {hl.page}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeleteHighlight(hl.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove highlight"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-800 sepia:text-[#241B14] dark:text-[#F7F7F5] italic border-l-2 border-blue-600 sepia:border-[#8B6B4A] pl-2 leading-relaxed select-text">
                          "{hl.text}"
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: PROGRESS & INFO ===================== */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Reading Progress Card */}
            <div className="p-4 bg-white sepia:bg-[#FFFDF9] dark:bg-slate-800 rounded-2xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 sepia:text-[#241B14] dark:text-white">Reading Progress</span>
                <span className="text-base font-bold font-mono text-blue-600 sepia:text-[#2563EB] dark:text-blue-400 tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 sepia:bg-[#EFE6DA] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="bg-gradient-to-r from-blue-600 to-teal-400 h-full rounded-full transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-slate-900 rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 sepia:text-[#8A7868] uppercase tracking-wider font-semibold">Current</div>
                  <div className="text-xs font-bold font-mono text-slate-900 sepia:text-[#241B14] dark:text-white tabular-nums">
                    {currentPage} / {metadata.pageCount}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-slate-900 rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 sepia:text-[#8A7868] uppercase tracking-wider font-semibold">Completed</div>
                  <div className="text-xs font-bold font-mono text-blue-600 sepia:text-[#2563EB] dark:text-blue-400 tabular-nums">
                    {highestRead}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-slate-900 rounded-xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 sepia:text-[#8A7868] uppercase tracking-wider font-semibold">Left</div>
                  <div className="text-xs font-bold font-mono text-slate-500 sepia:text-[#6B5B4D] dark:text-slate-400 tabular-nums">
                    {remainingPages}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="p-4 bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] rounded-2xl border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] space-y-2.5 text-xs shadow-2xs">
              <div className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white pb-1 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-[#332B23]">
                Document Details
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-[#332B23]">
                <span className="text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585]">File Name</span>
                <span className="font-bold text-slate-900 sepia:text-[#241B14] dark:text-white truncate max-w-[150px]" title={metadata.fileName}>
                  {metadata.fileName}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-[#332B23]">
                <span className="text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585]">File Size</span>
                <span className="font-mono font-bold text-slate-900 sepia:text-[#241B14] dark:text-white tabular-nums">
                  {formatFileSize(metadata.fileSize)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-[#332B23]">
                <span className="text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585]">Total Pages</span>
                <span className="font-mono font-bold text-slate-900 sepia:text-[#241B14] dark:text-white tabular-nums">
                  {metadata.pageCount} pages
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-[#332B23]">
                <span className="text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585]">Annotations</span>
                <span className="font-mono font-bold text-blue-600 sepia:text-[#8B6B4A] tabular-nums">
                  {notes.length} notes · {bookmarks.length} bookmarks
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500 sepia:text-[#7A6B5C] dark:text-[#858585]">Storage</span>
                <span className="text-[#2F8F63] font-bold">Local Browser (Private)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
