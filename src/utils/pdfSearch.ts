import { PDFDocumentProxy } from 'pdfjs-dist';
import { SearchMatch } from '../types';

export interface PageTextCache {
  pageNumber: number;
  text: string;
}

export async function extractAllPageTexts(pdfDoc: PDFDocumentProxy): Promise<PageTextCache[]> {
  const pages: PageTextCache[] = [];
  const numPages = pdfDoc.numPages;

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      pages.push({ pageNumber: i, text: pageText });
    } catch (err) {
      console.warn(`Failed to extract text for page ${i}:`, err);
      pages.push({ pageNumber: i, text: '' });
    }
  }

  return pages;
}

export function searchInExtractedPages(
  pagesCache: PageTextCache[],
  query: string,
  maxResults = 50
): SearchMatch[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const results: SearchMatch[] = [];

  for (const page of pagesCache) {
    const textLower = page.text.toLowerCase();
    let startIndex = 0;

    while (startIndex < textLower.length && results.length < maxResults) {
      const matchIndex = textLower.indexOf(cleanQuery, startIndex);
      if (matchIndex === -1) break;

      // Extract snippet around match (approx 40 chars before, 60 chars after)
      const snippetStart = Math.max(0, matchIndex - 35);
      const snippetEnd = Math.min(page.text.length, matchIndex + cleanQuery.length + 45);

      let snippet = page.text.substring(snippetStart, snippetEnd).trim();
      if (snippetStart > 0) snippet = '...' + snippet;
      if (snippetEnd < page.text.length) snippet = snippet + '...';

      results.push({
        page: page.pageNumber,
        snippet,
        matchIndex,
      });

      startIndex = matchIndex + cleanQuery.length;
    }
  }

  return results;
}
