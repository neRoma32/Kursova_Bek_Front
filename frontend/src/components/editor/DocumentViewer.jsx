import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { renderAsync } from 'docx-preview';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  FileText, 
  Edit3, 
  Download, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Setup pdfjs-dist worker natively in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * PdfPage Component - Renders a single PDF page when it intersects the viewport.
 */
const PdfPage = ({ pdfDoc, pageNum, zoom }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 }); // Default A4
  const renderTaskRef = useRef(null);

  // Lazy render when entering viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Render once and stay rendered
        }
      });
    }, {
      rootMargin: '250px', // start loading before it enters screen
      threshold: 0.01
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Fetch page aspect ratio dimensions
  useEffect(() => {
    if (!pdfDoc) return;
    let isCurrent = true;
    pdfDoc.getPage(pageNum).then(page => {
      if (isCurrent) {
        const viewport = page.getViewport({ scale: 1.0 });
        setPageSize({ width: viewport.width, height: viewport.height });
      }
    }).catch(err => console.error("Error reading page specifications:", err));

    return () => { isCurrent = false; };
  }, [pdfDoc, pageNum]);

  // Paint PDF onto canvas
  useEffect(() => {
    if (!pdfDoc || !isVisible || !canvasRef.current) return;

    let isCurrent = true;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isCurrent) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!canvas || !context) return;

        const viewport = page.getViewport({ scale: zoom });
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        canvas.width = viewport.width * devicePixelRatio;
        canvas.height = viewport.height * devicePixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(devicePixelRatio, devicePixelRatio);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        if (isCurrent) {
          setIsRendered(true);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error("Error during PDF rendering:", err);
        }
      }
    };

    render();

    return () => {
      isCurrent = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, isVisible, zoom]);

  // Reset render state when zoom changes
  useEffect(() => {
    setIsRendered(false);
  }, [zoom]);

  const scaledWidth = pageSize.width * zoom;
  const scaledHeight = pageSize.height * zoom;

  return (
    <div 
      ref={containerRef}
      className="relative mx-auto my-6 bg-surface rounded-xl shadow-soft border border-border overflow-hidden transition-all duration-300"
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`
      }}
    >
      {/* Physical PDF Canvas */}
      {isVisible && (
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`} 
        />
      )}

      {/* Shimmer loading layout placeholder */}
      {!isRendered && (
        <div className="absolute inset-0 bg-surfaceHover/80 flex flex-col justify-between p-12 select-none">
          {/* Shimmer animations */}
          <div className="h-6 bg-border/80 rounded w-1/4 animate-pulse" />
          
          <div className="flex-grow flex flex-col gap-4 justify-center my-8">
            <div className="h-4 bg-border/60 rounded w-full animate-pulse" />
            <div className="h-4 bg-border/60 rounded w-11/12 animate-pulse" />
            <div className="h-4 bg-border/60 rounded w-10/12 animate-pulse" />
            <div className="h-4 bg-border/60 rounded w-full animate-pulse" />
            <div className="h-4 bg-border/60 rounded w-8/12 animate-pulse" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-4 bg-border/80 rounded w-16 animate-pulse" />
            <span className="text-xs font-semibold text-textMuted">Стор. {pageNum}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * DocxViewer Component - Renders DOCX using docx-preview client-side parser.
 */
const DocxViewer = ({ file, zoom, onError }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!file || !containerRef.current) return;
    
    let isCurrent = true;
    setIsLoading(true);

    const render = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!isCurrent) return;

        containerRef.current.innerHTML = ''; // Reset container content
        await renderAsync(arrayBuffer, containerRef.current, null, {
          className: 'docx-preview-doc',
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          experimental: true
        });

        if (isCurrent) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error previewing Word document:", err);
        if (isCurrent && onError) {
          onError(err);
        }
      }
    };
    
    render();

    return () => {
      isCurrent = false;
    };
  }, [file, onError]);

  return (
    <div className="relative w-full flex justify-center py-6 bg-background/50 min-h-[500px] overflow-x-auto">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-textMuted">Оцифрування та форматування документа...</p>
        </div>
      )}
      
      {/* Outer wrapper to container layout */}
      <div 
        className="docx-render-container bg-surface shadow-soft-dark border border-border rounded-xl p-8 md:p-12 max-w-4xl text-text overflow-hidden transition-all duration-300"
        style={{
          '--docx-zoom': zoom,
          zoom: 'var(--docx-zoom, 1)',
          width: '100%',
          maxWidth: '850px',
        }}
        ref={containerRef}
      />
    </div>
  );
};

/**
 * Main DocumentViewer Component
 */
export const DocumentViewer = ({ uploadedFile, viewMode, setViewMode, zoom, setZoom, onFallbackTextMode, children }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [renderError, setRenderError] = useState(null);

  // Initialize and load PDF
  useEffect(() => {
    if (!uploadedFile || uploadedFile.type !== 'pdf') {
      setPdfDoc(null);
      setNumPages(0);
      setRenderError(null);
      return;
    }

    let isCurrent = true;
    setIsLoadingPdf(true);
    setRenderError(null);

    const loadPdf = async () => {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          if (!isCurrent) return;
          try {
            const typedarray = new Uint8Array(this.result);
            const loadingTask = pdfjsLib.getDocument({ data: typedarray });
            const pdf = await loadingTask.promise;
            if (isCurrent) {
              setPdfDoc(pdf);
              setNumPages(pdf.numPages);
              setIsLoadingPdf(false);
            }
          } catch (err) {
            console.error("PDF Parsing Error inside FileReader:", err);
            if (isCurrent) {
              setRenderError(err);
              setIsLoadingPdf(false);
            }
          }
        };
        fileReader.readAsArrayBuffer(uploadedFile.file);
      } catch (err) {
        console.error("Error reading PDF file:", err);
        if (isCurrent) {
          setRenderError(err);
          setIsLoadingPdf(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCurrent = false;
    };
  }, [uploadedFile]);

  // Zoom actions
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.15));
  const handleZoomIn = () => setZoom(prev => Math.min(2.0, prev + 0.15));
  const handleResetZoom = () => setZoom(1.0);

  // Download uploaded original file
  const handleDownloadOriginal = () => {
    if (!uploadedFile) return;
    const url = window.URL.createObjectURL(uploadedFile.file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uploadedFile.name);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const hasError = renderError !== null;

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border overflow-hidden">
      
      {/* Styles for Docx formatting fallback when Firefox is used */}
      <style>{`
        @supports not (zoom: 1) {
          .docx-render-container {
            transform: scale(var(--docx-zoom, 1));
            transform-origin: top center;
            margin-bottom: calc(var(--docx-zoom) * 200px);
          }
        }
        /* Custom formatting to blend docx-preview styling with theme */
        .docx-preview-doc {
          font-family: inherit !important;
          color: inherit !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .docx-preview-doc table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1rem 0 !important;
        }
        .docx-preview-doc td, .docx-preview-doc th {
          border: 1px solid var(--color-border) !important;
          padding: 8px !important;
        }
        .docx-preview-doc p {
          margin-bottom: 1em !important;
          line-height: 1.625 !important;
        }
        .docx-preview-doc h1, .docx-preview-doc h2, .docx-preview-doc h3 {
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
        }
      `}</style>

      {/* Toolbar component */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border-b border-border px-4 py-2.5 z-10 select-none">
        
        {/* Toggle Mode buttons */}
        <div className="flex items-center gap-1.5 bg-surfaceHover border border-border rounded-xl p-1">
          <button
            onClick={() => setViewMode('document')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'document' 
                ? 'bg-surface text-text shadow-sm' 
                : 'text-textMuted hover:text-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Документ</span>
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'text' 
                ? 'bg-surface text-text shadow-sm' 
                : 'text-textMuted hover:text-text'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Текст</span>
          </button>
        </div>

        {/* Zoom controls */}
        {viewMode === 'document' && !hasError && (
          <div className="flex items-center gap-1 bg-surfaceHover border border-border rounded-xl p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-textMuted hover:bg-surface hover:text-text transition-colors"
              title="Зменшити"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-text px-2 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-textMuted hover:bg-surface hover:text-text transition-colors"
              title="Збільшити"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-textMuted hover:bg-surface hover:text-text border-l border-border transition-colors pl-2"
              title="Скинути зум"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadOriginal}
          startIcon={<Download className="w-4 h-4" />}
          className="shadow-sm rounded-xl font-semibold border-border bg-surface text-text hover:bg-surfaceHover"
        >
          Завантажити
        </Button>
      </div>

      {/* Main visual viewport */}
      <div className={`flex-grow overflow-y-auto overflow-x-hidden no-scrollbar ${
        viewMode === 'document' ? 'bg-slate-100 dark:bg-slate-900/60 p-4 md:p-6' : 'p-0'
      }`}>
        {viewMode === 'text' ? (
          children
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface rounded-xl border border-dashed border-red-200 shadow-soft max-w-md mx-auto my-12">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-text mb-2">Не вдалося відкрити документ</h4>
            <p className="text-sm text-textMuted mb-6">
              Помилка попереднього перегляду файлу. Тим не менш, ви можете відредагувати та переглянути його plain text.
            </p>
            <Button
              variant="accent"
              size="md"
              onClick={onFallbackTextMode}
              startIcon={<Edit3 className="w-4 h-4" />}
              className="rounded-xl font-bold"
            >
              Перейти в режим Тексту
            </Button>
          </div>
        ) : (
          <>
            {uploadedFile.type === 'pdf' ? (
              isLoadingPdf ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-4" />
                  <p className="text-sm font-medium text-textMuted">Завантаження PDF документа...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center select-none bg-background/50 py-4 rounded-xl min-h-[400px]">
                  {Array.from({ length: numPages }, (_, index) => (
                    <PdfPage 
                      key={index + 1}
                      pdfDoc={pdfDoc}
                      pageNum={index + 1}
                      zoom={zoom}
                    />
                  ))}
                </div>
              )
            ) : (
              <DocxViewer 
                file={uploadedFile.file} 
                zoom={zoom} 
                onError={(err) => setRenderError(err)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
