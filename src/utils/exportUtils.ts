import { Bookmark, Highlight, Note } from '../types';

export function exportNotesToMarkdown(
  documentTitle: string,
  fileName: string,
  notes: Note[],
  bookmarks: Bookmark[],
  highlights: Highlight[]
): void {
  let content = `# StudyPDF Study Notes\n\n`;
  content += `**Document:** ${documentTitle} (${fileName})\n`;
  content += `**Exported:** ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })} at ${new Date().toLocaleTimeString()}\n\n`;
  content += `---\n\n`;

  // Bookmarks section
  if (bookmarks.length > 0) {
    content += `## Bookmarked Pages\n\n`;
    bookmarks
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((b) => {
        content += `- **Page ${b.page}:** ${b.title}\n`;
      });
    content += `\n---\n\n`;
  }

  // Highlights section
  if (highlights.length > 0) {
    content += `## Highlighted Passages\n\n`;
    highlights
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((h) => {
        content += `> "${h.text}"\n\n`;
        content += `*Page ${h.page} · Color: ${h.color}*\n\n`;
      });
    content += `---\n\n`;
  }

  // Notes section
  content += `## Study Notes\n\n`;
  if (notes.length === 0) {
    content += `_No notes recorded yet._\n`;
  } else {
    notes
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((n) => {
        content += `### Page ${n.page}\n\n`;
        content += `${n.content}\n\n`;
        content += `*Recorded ${new Date(n.createdAt).toLocaleDateString()}*\n\n`;
      });
  }

  downloadBlob(content, `${fileName.replace(/\.pdf$/i, '')}-study-notes.md`, 'text/markdown');
}

export function exportNotesToText(
  documentTitle: string,
  fileName: string,
  notes: Note[],
  bookmarks: Bookmark[],
  highlights: Highlight[]
): void {
  let content = `STUDYPDF NOTES\n`;
  content += `========================================\n`;
  content += `Document: ${documentTitle} (${fileName})\n`;
  content += `Exported: ${new Date().toLocaleString()}\n`;
  content += `========================================\n\n`;

  if (bookmarks.length > 0) {
    content += `BOOKMARKS:\n`;
    bookmarks
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((b) => {
        content += `[Page ${b.page}] ${b.title}\n`;
      });
    content += `\n----------------------------------------\n\n`;
  }

  if (highlights.length > 0) {
    content += `HIGHLIGHTS:\n`;
    highlights
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((h) => {
        content += `[Page ${h.page} (${h.color})]\n"${h.text}"\n\n`;
      });
    content += `----------------------------------------\n\n`;
  }

  content += `NOTES:\n`;
  if (notes.length === 0) {
    content += `No notes recorded.\n`;
  } else {
    notes
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((n) => {
        content += `Page ${n.page}:\n${n.content}\n\n`;
      });
  }

  downloadBlob(content, `${fileName.replace(/\.pdf$/i, '')}-study-notes.txt`, 'text/plain');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
