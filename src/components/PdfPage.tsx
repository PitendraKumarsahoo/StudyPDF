import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from '../utils/pdfWorker';
import { Highlight, HighlightColor, HighlightRect, ThemeMode } from '../types';

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  theme: ThemeMode;
  highlights: Highlight[];
  isFlashTarget?: boolean;
  onPageVisible: (pageNumber: number) => void;
  onTextSelected: (
    selectedText: string,
    position: { top: number; left: number; bottom?: number },
    pageNumber: number,
    rects: HighlightRect[]
  ) => void;
}

export const PdfPage: React.FC<PdfPageProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  theme,
  highlights,
  isFlashTarget = false,
  onPageVisible,
  onTextSelected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [isRendered, setIsRendered] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 612,
    height: 792,
  });

  // Observe page visibility to update current reading page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            onPageVisible(pageNumber);
          }
        }
      },
      {
        threshold: [0.1, 0.35, 0.7],
        rootMargin: '-5% 0px -40% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onPageVisible]);

  // Render canvas & text layer
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!canvasRef.current || !pdfDoc) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        setDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        // Retina display support
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        // Cancel previous render task if still in flight
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (isCancelled) return;
        setIsRendered(true);

        // Render Text Layer
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.width = `${Math.floor(viewport.width)}px`;
          textLayerRef.current.style.height = `${Math.floor(viewport.height)}px`;
          textLayerRef.current.style.setProperty('--scale-factor', `${viewport.scale}`);
          textLayerRef.current.style.setProperty('--total-scale-factor', `${viewport.scale}`);
          textLayerRef.current.style.setProperty('--user-unit', '1');

          try {
            const textContent = await page.getTextContent();
            if (isCancelled) return;

            // In pdfjs-dist: new TextLayer({ textContentSource, container, viewport })
            const textLayer = new (pdfjsLib as any).TextLayer({
              textContentSource: textContent,
              container: textLayerRef.current,
              viewport: viewport,
            });
            await textLayer.render();
          } catch (textErr) {
            console.warn('Text layer render failed:', textErr);
          }
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  // Handle text selection on mouse up, double-click, or context menu
  const checkSelectionAndNotify = () => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 1) return;

      const container = containerRef.current;
      if (!container) return;

      // Check if selection intersects this container
      let isInside = false;
      try {
        if (container.contains(selection.anchorNode) || container.contains(selection.focusNode)) {
          isInside = true;
        } else if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (container.contains(range.commonAncestorContainer)) {
            isInside = true;
          }
        }
      } catch {
        // Ignore
      }

      if (!isInside) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate normalized relative rects for highlighting
      const clientRects = Array.from(range.getClientRects());
      const normalizedRects: HighlightRect[] = clientRects
        .filter((cr) => cr.width > 0 && cr.height > 0)
        .map((cr) => ({
          x: Math.max(0, Math.min(1, (cr.left - containerRect.left) / containerRect.width)),
          y: Math.max(0, Math.min(1, (cr.top - containerRect.top) / containerRect.height)),
          width: Math.max(0, Math.min(1, cr.width / containerRect.width)),
          height: Math.max(0, Math.min(1, cr.height / containerRect.height)),
        }));

      onTextSelected(
        selectedText,
        {
          top: rect.top,
          left: rect.left + rect.width / 2,
          bottom: rect.bottom,
        },
        pageNumber,
        normalizedRects.length > 0 ? normalizedRects : [
          {
            x: Math.max(0, (rect.left - containerRect.left) / containerRect.width),
            y: Math.max(0, (rect.top - containerRect.top) / containerRect.height),
            width: Math.min(1, rect.width / containerRect.width),
            height: Math.min(1, rect.height / containerRect.height),
          }
        ]
      );
    });
  };

  const pageHighlights = highlights.filter((h) => h.page === pageNumber);

  const getHighlightBgClass = (color: HighlightColor) => {
    switch (color) {
      case 'yellow':
        return 'bg-[#F4D77D]/45 border-b-2 border-[#8B6B4A]';
      case 'green':
        return 'bg-emerald-400/30 border-b-2 border-emerald-500';
      case 'blue':
        return 'bg-sky-400/30 border-b-2 border-sky-500';
      case 'pink':
        return 'bg-pink-400/30 border-b-2 border-pink-500';
      default:
        return 'bg-[#F4D77D]/45 border-b-2 border-[#8B6B4A]';
    }
  };

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      onMouseUp={checkSelectionAndNotify}
      onDoubleClick={checkSelectionAndNotify}
      onContextMenu={(e) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length >= 1) {
          e.preventDefault();
          checkSelectionAndNotify();
        }
      }}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        // @ts-ignore
        '--scale-factor': `${scale}`,
        // @ts-ignore
        '--total-scale-factor': `${scale}`,
      }}
      className={`relative mx-auto my-4 transition-all duration-200 select-text rounded-sm overflow-hidden ${
        theme === 'dark'
          ? 'bg-[#181512] shadow-2xl shadow-black/70 border border-[#3D3126]'
          : theme === 'sepia'
          ? 'bg-[#FCF6E9] shadow-md shadow-stone-900/5 border border-[#E2D5C3]'
          : 'bg-white shadow-md shadow-stone-900/5 border border-[#E6E3DE]'
      } ${
        isFlashTarget ? 'page-highlight-flash ring-4 ring-[#8B6B4A]/50' : ''
      }`}
    >
      {/* Loading Skeleton */}
      {!isRendered && (
        <div
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
          className={`absolute inset-0 flex flex-col items-center justify-center animate-pulse ${
            theme === 'dark'
              ? 'bg-[#201C18] text-[#858585]'
              : theme === 'sepia'
              ? 'bg-[#F4E9D5] text-[#8C7A68]'
              : 'bg-neutral-100 text-neutral-400'
          }`}
        >
          <div className="w-12 h-1 bg-current opacity-30 rounded mb-2" />
          <span className="text-xs font-mono">Page {pageNumber}</span>
        </div>
      )}

      {/* PDF Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Text Layer for native selection and search highlighting */}
      <div
        ref={textLayerRef}
        className="textLayer"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          // @ts-ignore
          '--scale-factor': `${scale}`,
          // @ts-ignore
          '--total-scale-factor': `${scale}`,
          // @ts-ignore
          '--user-unit': '1',
        }}
      />

      {/* Highlight Overlays */}
      {isRendered && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {pageHighlights.map((hl) => (
            <React.Fragment key={hl.id}>
              {hl.rects && hl.rects.length > 0 ? (
                hl.rects.map((r, rIdx) => (
                  <div
                    key={`${hl.id}-${rIdx}`}
                    style={{
                      left: `${r.x * 100}%`,
                      top: `${r.y * 100}%`,
                      width: `${r.width * 100}%`,
                      height: `${r.height * 100}%`,
                    }}
                    className={`absolute rounded-[1px] ${getHighlightBgClass(hl.color)}`}
                  />
                ))
              ) : (
                /* Fallback banner indicator if rects not available */
                <div
                  className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] rounded ${getHighlightBgClass(
                    hl.color
                  )}`}
                >
                  Highlight: "{hl.text.slice(0, 30)}..."
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Page Number indicator badge (subtle, quiet corner) */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-neutral-400 select-none opacity-40">
        {pageNumber}
      </div>
    </div>
  );
};
