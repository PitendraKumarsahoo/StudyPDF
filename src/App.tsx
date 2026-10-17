/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { PdfViewer } from './components/PdfViewer';
import { UploadDropzone } from './components/UploadDropzone';
import { ResumeModal } from './components/ResumeModal';
import { LegalModal } from './components/LegalModals';
import { ShortcutsModal } from './components/ShortcutsModal';
import { DocumentMetadata, ThemeMode } from './types';
import { pdfjsLib } from './utils/pdfWorker';
import { generatePdfFromPlainText, generateSamplePdfArrayBuffer } from './utils/samplePdf';
import {
  getBookmarks,
  getNotes,
  getPdfBuffer,
  getRecentDocuments,
  getStoredTheme,
  removeRecentDocument,
  saveBookmarks,
  saveNotes,
  saveRecentDocument,
  storePdfBuffer,
  storeTheme,
} from './utils/storage';

export default function App() {
  const [view, setView] = useState<'landing' | 'reader'>('landing');
  const [currentBuffer, setCurrentBuffer] = useState<ArrayBuffer | null>(null);
  const [currentDoc, setCurrentDoc] = useState<DocumentMetadata | null>(null);
  const [targetInitialPage, setTargetInitialPage] = useState<number>(1);

  const [recentDocs, setRecentDocs] = useState<DocumentMetadata[]>(() => getRecentDocuments());
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [resumePrompt, setResumePrompt] = useState<{
    doc: DocumentMetadata;
    buffer: ArrayBuffer;
  } | null>(null);

  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync theme changes
  useEffect(() => {
    storeTheme(theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    }
  }, [theme]);

  const handleToggleTheme = (newTheme?: ThemeMode) => {
    if (newTheme) {
      setTheme(newTheme);
      return;
    }
    setTheme((prev) => {
      // Cycle: light -> sepia -> dark -> light
      if (prev === 'light') return 'sepia';
      if (prev === 'sepia') return 'dark';
      return 'light';
    });
  };

  // Process a loaded ArrayBuffer
  const processPdfBuffer = async (
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number,
    existingDocId?: string
  ) => {
    setIsProcessingPdf(true);
    setProcessingError(null);

    try {
      // Validate with pdfjs
      const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
      const doc = await loadingTask.promise;
      const pageCount = doc.numPages;

      const docId =
        existingDocId ||
        `doc-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}-${fileSize}`;

      // Check if we have existing progress
      const existing = recentDocs.find((d) => d.id === docId);

      const metadata: DocumentMetadata = {
        id: docId,
        title: fileName.replace(/\.pdf$/i, ''),
        fileName: fileName,
        fileSize: fileSize,
        pageCount: pageCount,
        currentPage: existing ? existing.currentPage : 1,
        highestPageRead: existing ? existing.highestPageRead : 1,
        lastOpened: Date.now(),
        bookmarksCount: existing ? existing.bookmarksCount : getBookmarks(docId).length,
        notesCount: existing ? existing.notesCount : getNotes(docId).length,
        highlightsCount: existing ? existing.highlightsCount : 0,
      };

      // Save metadata and buffer
      saveRecentDocument(metadata);
      await storePdfBuffer(docId, buffer, fileName);
      setRecentDocs(getRecentDocuments());

      setIsProcessingPdf(false);
      setIsUploadModalOpen(false);

      // Check if user had read past page 1
      if (existing && existing.currentPage > 1) {
        setResumePrompt({ doc: metadata, buffer });
      } else {
        setCurrentDoc(metadata);
        setCurrentBuffer(buffer);
        setTargetInitialPage(1);
        setView('reader');
      }
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      setIsProcessingPdf(false);
      setProcessingError(
        'We could not open this PDF. The file may be password protected or corrupted.'
      );
    }
  };

  // Handle uploaded File (PDF or plain text/markdown)
  const handleFileSelect = (file: File) => {
    setIsProcessingPdf(true);
    setProcessingError(null);

    const isTextFile =
      file.name.toLowerCase().endsWith('.txt') ||
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown') ||
      file.name.toLowerCase().endsWith('.text') ||
      file.type.startsWith('text/');

    if (isTextFile) {
      const textReader = new FileReader();
      textReader.onload = async (e) => {
        try {
          const textContent = (e.target?.result as string) || '';
          const pdfBuffer = generatePdfFromPlainText(textContent, file.name);
          const pdfName = file.name.replace(/\.(txt|md|markdown|text)$/i, '') + '.pdf';
          await processPdfBuffer(pdfBuffer, pdfName, pdfBuffer.byteLength);
        } catch (err: any) {
          console.error('Error generating PDF from text file:', err);
          setIsProcessingPdf(false);
          setProcessingError('Could not parse text document into study space.');
        }
      };
      textReader.onerror = () => {
        setIsProcessingPdf(false);
        setProcessingError('Failed to read text file.');
      };
      textReader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        await processPdfBuffer(e.target.result, file.name, file.size);
      } else {
        setIsProcessingPdf(false);
        setProcessingError('Failed to read file from disk.');
      }
    };
    reader.onerror = () => {
      setIsProcessingPdf(false);
      setProcessingError('Failed to load file.');
    };
    reader.readAsArrayBuffer(file);
  };

  // Try Sample PDF handler
  const handleTrySamplePdf = async () => {
    setIsProcessingPdf(true);
    setIsUploadModalOpen(false);
    setProcessingError(null);

    try {
      const sampleBuffer = generateSamplePdfArrayBuffer();
      const sampleDocId = 'doc-studypdf-sample-guide';
      const sampleFileName = 'Distributed-Systems-Study-Guide.pdf';

      // Pre-seed sample bookmark and note for demo if first time
      const existingBm = getBookmarks(sampleDocId);
      if (existingBm.length === 0) {
        saveBookmarks(sampleDocId, [
          {
            id: 'bm-sample-1',
            docId: sampleDocId,
            page: 1,
            title: '1.2 CAP Theorem Proof',
            createdAt: Date.now() - 3600000,
          },
          {
            id: 'bm-sample-2',
            docId: sampleDocId,
            page: 2,
            title: '2.2 B+ Tree Index Characteristics',
            createdAt: Date.now() - 1800000,
          },
        ]);
      }

      const existingNotes = getNotes(sampleDocId);
      if (existingNotes.length === 0) {
        saveNotes(sampleDocId, [
          {
            id: 'note-sample-1',
            docId: sampleDocId,
            page: 1,
            content: 'Crucial exam concept: In real networks, partitions (P) cannot be avoided, so we always choose between CP and AP.',
            createdAt: Date.now() - 3600000,
            updatedAt: Date.now() - 3600000,
            color: 'amber',
          },
          {
            id: 'note-sample-2',
            docId: sampleDocId,
            page: 4,
            content: 'Two-Phase Locking (2PL) guarantees conflict serializability. Remember Strict 2PL holds exclusive locks until commit!',
            createdAt: Date.now() - 1200000,
            updatedAt: Date.now() - 1200000,
            color: 'blue',
          },
        ]);
      }

      await processPdfBuffer(sampleBuffer, sampleFileName, sampleBuffer.byteLength, sampleDocId);
    } catch (err) {
      console.error('Failed to create sample PDF:', err);
      setIsProcessingPdf(false);
    }
  };

  // Resume document from Recent list
  const handleResumeDoc = async (doc: DocumentMetadata) => {
    setIsProcessingPdf(true);
    setProcessingError(null);

    // Try to load cached buffer from IndexedDB
    const cached = await getPdfBuffer(doc.id);
    if (cached) {
      setIsProcessingPdf(false);
      if (doc.currentPage > 1) {
        setResumePrompt({ doc, buffer: cached });
      } else {
        setCurrentDoc(doc);
        setCurrentBuffer(cached);
        setTargetInitialPage(1);
        setView('reader');
      }
    } else {
      // If sample guide or seeded sample, re-generate
      if (doc.id.startsWith('sample-') || doc.id === 'doc-studypdf-sample-guide') {
        const sampleBuffer = generateSamplePdfArrayBuffer();
        await storePdfBuffer(doc.id, sampleBuffer, doc.fileName);
        setCurrentDoc(doc);
        setCurrentBuffer(sampleBuffer);
        setTargetInitialPage(doc.currentPage || 1);
        setView('reader');
        setIsProcessingPdf(false);
      } else {
        // Prompt user to pick file again
        setIsProcessingPdf(false);
        setIsUploadModalOpen(true);
        setProcessingError(
          `Please re-select "${doc.fileName}" from your device to reopen this document.`
        );
      }
    }
  };

  // Delete document from recent list
  const handleDeleteRecentDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentDocument(id);
    setRecentDocs(getRecentDocuments());
  };

  // Resume modal answers
  const handleResumeContinue = () => {
    if (!resumePrompt) return;
    setCurrentDoc(resumePrompt.doc);
    setCurrentBuffer(resumePrompt.buffer);
    setTargetInitialPage(resumePrompt.doc.currentPage || 1);
    setResumePrompt(null);
    setView('reader');
  };

  const handleResumeStartBeginning = () => {
    if (!resumePrompt) return;
    setCurrentDoc(resumePrompt.doc);
    setCurrentBuffer(resumePrompt.buffer);
    setTargetInitialPage(1);
    setResumePrompt(null);
    setView('reader');
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        theme === 'sepia'
          ? 'bg-[#F6EFE6] text-[#241B14]'
          : theme === 'dark'
          ? 'bg-[#0B1120] text-[#F8FAFC]'
          : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {view === 'landing' ? (
        <LandingPage
          recentDocs={recentDocs}
          theme={theme}
          onOpenPdfClick={() => setIsUploadModalOpen(true)}
          onTrySamplePdf={handleTrySamplePdf}
          onResumeDoc={handleResumeDoc}
          onDeleteRecentDoc={handleDeleteRecentDoc}
          onToggleTheme={() => handleToggleTheme()}
          onOpenLegal={(type) => setLegalModal(type)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      ) : (
        currentBuffer &&
        currentDoc && (
          <PdfViewer
            pdfBuffer={currentBuffer}
            metadata={currentDoc}
            theme={theme}
            initialPage={targetInitialPage}
            onBack={() => {
              setView('landing');
              setRecentDocs(getRecentDocuments());
            }}
            onToggleTheme={handleToggleTheme}
          />
        )
      )}

      {/* Keyboard Shortcuts Modal (Available on Landing & Global) */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Upload Dropzone Modal */}
      {isUploadModalOpen && (
        <UploadDropzone
          isModal
          isLoading={isProcessingPdf}
          errorMessage={processingError}
          onClearError={() => setProcessingError(null)}
          onFileSelect={handleFileSelect}
          onClose={() => {
            setIsUploadModalOpen(false);
            setProcessingError(null);
          }}
        />
      )}

      {/* Resume Progress Confirmation Modal */}
      {resumePrompt && (
        <ResumeModal
          isOpen={true}
          fileName={resumePrompt.doc.fileName}
          savedPage={resumePrompt.doc.currentPage}
          totalPages={resumePrompt.doc.pageCount}
          onContinue={handleResumeContinue}
          onStartBeginning={handleResumeStartBeginning}
        />
      )}

      {/* Legal & Privacy Modals */}
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}
