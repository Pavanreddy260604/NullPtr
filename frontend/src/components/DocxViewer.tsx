// components/DocxViewer.tsx
import { useState, useRef, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, Sun, Moon, Type, Columns } from 'lucide-react';

interface DocxViewerProps {
    docxUrl: string;
    unitTitle?: string;
    onClose: () => void;
}

export function DocxViewer({
    docxUrl,
    unitTitle = 'Document',
    onClose
}: DocxViewerProps) {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [zoom, setZoom] = useState<number>(100);
    const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
    const [fontSize, setFontSize] = useState<number>(16);
    const [layout, setLayout] = useState<'single' | 'double'>('single');
    const contentRef = useRef<HTMLDivElement>(null);

    // Load and convert DOCX to HTML
    useEffect(() => {
        const loadDocx = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await fetch(docxUrl);
                if (!response.ok) {
                    throw new Error('Failed to load document');
                }

                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml(
                    { arrayBuffer },
                    {
                        styleMap: [
                            "p[style-name='Heading 1'] => h1:fresh",
                            "p[style-name='Heading 2'] => h2:fresh",
                            "p[style-name='Heading 3'] => h3:fresh",
                            "p[style-name='Heading 4'] => h4:fresh",
                            "p[style-name='Heading 5'] => h5:fresh",
                            "p[style-name='Heading 6'] => h6:fresh",
                            "p[style-name='Title'] => h1.title:fresh",
                            "p[style-name='Subtitle'] => h2.subtitle:fresh",
                            "r[style-name='Strong'] => strong",
                            "p[style-name='Quote'] => blockquote:fresh",
                            "p[style-name='Intense Quote'] => blockquote.intense:fresh"
                        ]
                    }
                );

                setHtmlContent(result.value);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load document');
            } finally {
                setIsLoading(false);
            }
        };

        loadDocx();
    }, [docxUrl]);

    const zoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const resetZoom = () => setZoom(100);

    const increaseFont = () => setFontSize(prev => Math.min(prev + 1, 24));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 1, 12));

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-300 text-lg">Loading document...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 dark:text-red-400 text-lg mb-4">Error loading document</div>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' :
            theme === 'sepia' ? 'bg-amber-50' : 'bg-white'
            }`}>
            {/* Enhanced Header with Controls */}
            <header className={`sticky top-0 z-10 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' :
                theme === 'sepia' ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between px-6 py-3">
                    <div className={`font-semibold transition-colors duration-300 ${theme === 'dark' ? 'text-white' :
                        theme === 'sepia' ? 'text-amber-900' : 'text-gray-900'
                        }`}>
                        {unitTitle}
                    </div>

                    {/* Reading Controls */}
                    <div className="flex items-center gap-4">
                        {/* Layout Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <Button
                                variant={layout === 'single' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setLayout('single')}
                                className={`h-8 px-3 text-xs ${layout === 'single' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                                    }`}
                            >
                                Single
                            </Button>
                            <Button
                                variant={layout === 'double' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setLayout('double')}
                                className={`h-8 px-3 text-xs ${layout === 'double' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                                    }`}
                            >
                                <Columns className="w-3 h-3 mr-1" />
                                Double
                            </Button>
                        </div>

                        {/* Font Size Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={decreaseFont}
                                className="h-8 w-8 p-0"
                            >
                                <Type className="w-3 h-3" />
                                <span className="text-xs">-</span>
                            </Button>
                            <span className={`text-xs font-medium w-8 text-center transition-colors duration-300 ${theme === 'dark' ? 'text-gray-300' :
                                theme === 'sepia' ? 'text-amber-800' : 'text-gray-600'
                                }`}>
                                {fontSize}px
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={increaseFont}
                                className="h-8 w-8 p-0"
                            >
                                <Type className="w-3 h-3" />
                                <span className="text-xs">+</span>
                            </Button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={zoomOut}
                                className="h-8 w-8 p-0"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className={`text-xs font-medium w-12 text-center transition-colors duration-300 ${theme === 'dark' ? 'text-gray-300' :
                                theme === 'sepia' ? 'text-amber-800' : 'text-gray-600'
                                }`}>
                                {zoom}%
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={zoomIn}
                                className="h-8 w-8 p-0"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Theme Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <Button
                                variant={theme === 'light' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setTheme('light')}
                                className={`h-8 w-8 p-0 ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                                    }`}
                            >
                                <Sun className="w-3 h-3" />
                            </Button>
                            <Button
                                variant={theme === 'sepia' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setTheme('sepia')}
                                className={`h-8 w-8 p-0 ${theme === 'sepia' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                                    }`}
                            >
                                <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setTheme('dark')}
                                className={`h-8 w-8 p-0 ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                                    }`}
                            >
                                <Moon className="w-3 h-3" />
                            </Button>
                        </div>

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Enhanced Document Content */}
            <div className="h-[calc(100vh-65px)] overflow-auto">
                <div
                    ref={contentRef}
                    className={`mx-auto transition-all duration-300 ${layout === 'double' ? 'max-w-6xl columns-1 lg:columns-2 gap-12' : 'max-w-4xl'
                        } p-8`}
                    style={{
                        zoom: `${zoom}%`,
                        columnFill: 'auto'
                    }}
                >
                    <div
                        className={`word-document ${layout === 'double' ? 'break-inside-avoid' : ''} ${theme === 'dark' ? 'word-dark' :
                            theme === 'sepia' ? 'word-sepia' : 'word-light'
                            }`}
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            </div>

            {/* Enhanced CSS for optimal readability */}
            <style jsx>{`
                .word-document {
                    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
                    line-height: 1.7;
                    text-align: justify;
                    hyphens: auto;
                }

                /* Light Theme */
                .word-light {
                    color: #374151;
                    background: white;
                }

                .word-light h1 {
                    color: #1e40af;
                    font-weight: 700;
                    font-size: 1.8em;
                    margin: 1.5em 0 0.8em 0;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 0.3em;
                }

                .word-light h2 {
                    color: #2563eb;
                    font-weight: 600;
                    font-size: 1.5em;
                    margin: 1.3em 0 0.6em 0;
                }

                .word-light h3 {
                    color: #3b82f6;
                    font-weight: 600;
                    font-size: 1.3em;
                    margin: 1.1em 0 0.5em 0;
                }

                .word-light p {
                    margin: 0 0 1em 0;
                    text-align: justify;
                }

                /* Dark Theme */
                .word-dark {
                    color: #e5e7eb;
                    background: transparent;
                }

                .word-dark h1 {
                    color: #60a5fa;
                    border-bottom-color: #4b5563;
                }

                .word-dark h2 {
                    color: #93c5fd;
                }

                .word-dark h3 {
                    color: #bfdbfe;
                }

                /* Sepia Theme */
                .word-sepia {
                    color: #5c4b37;
                    background: transparent;
                }

                .word-sepia h1 {
                    color: #92400e;
                    border-bottom-color: #d6d3d1;
                }

                .word-sepia h2 {
                    color: #b45309;
                }

                .word-sepia h3 {
                    color: #d97706;
                }

                /* Common styles for all themes */
                .word-document h4, .word-document h5, .word-document h6 {
                    font-weight: 600;
                    margin: 1em 0 0.4em 0;
                }

                .word-document strong, .word-document b {
                    font-weight: 700;
                    color: inherit;
                }

                .word-document em, .word-document i {
                    font-style: italic;
                }

                .word-document u {
                    text-decoration: underline;
                }

                .word-document ul, .word-document ol {
                    margin: 0.8em 0;
                    padding-left: 2em;
                }

                .word-document li {
                    margin: 0.4em 0;
                    line-height: 1.6;
                }

                .word-document li::marker {
                    color: #6b7280;
                }

                .word-document table {
                    border-collapse: collapse;
                    margin: 1.2em 0;
                    width: 100%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .word-document th, .word-document td {
                    border: 1px solid;
                    padding: 0.75em 1em;
                    text-align: left;
                }

                .word-light th, .word-light td {
                    border-color: #e5e7eb;
                }

                .word-dark th, .word-dark td {
                    border-color: #4b5563;
                }

                .word-sepia th, .word-sepia td {
                    border-color: #d6d3d1;
                }

                .word-document th {
                    font-weight: 600;
                }

                .word-light th {
                    background-color: #f8fafc;
                }

                .word-dark th {
                    background-color: #374151;
                }

                .word-sepia th {
                    background-color: #fef3c7;
                }

                .word-document blockquote {
                    margin: 1.2em 0;
                    padding: 1em 1.5em;
                    border-left: 4px solid;
                    font-style: italic;
                    background: rgba(0,0,0,0.02);
                    border-radius: 0 8px 8px 0;
                }

                .word-light blockquote {
                    border-left-color: #3b82f6;
                    background: #f8fafc;
                }

                .word-dark blockquote {
                    border-left-color: #60a5fa;
                    background: #1f2937;
                }

                .word-sepia blockquote {
                    border-left-color: #d97706;
                    background: #fef7cd;
                }

                .word-document code {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    background: rgba(0,0,0,0.05);
                    padding: 0.2em 0.4em;
                    border-radius: 4px;
                    font-size: 0.9em;
                }

                .word-dark code {
                    background: rgba(255,255,255,0.1);
                }

                /* Smooth scrolling */
                .word-document {
                    scroll-behavior: smooth;
                }

                /* Focus styles for accessibility */
                .word-document :focus {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
}