import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, ImageIcon, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordAttempt } from "@/lib/progress";
import { useAuth } from "@/contexts/AuthContext";

interface ContentBlock {
  type: 'text' | 'heading' | 'subheading' | 'list' | 'code' | 'callout' | 'diagram' | 'image';
  content?: string;
  items?: string[];
  label?: string;
  src?: string;
}

interface DescriptiveQuestion {
  _id: string;
  question: string;
  answer: ContentBlock[];
  topic?: string;
  subjectId?: string;
  unitId?: string;
}

interface DescriptiveCardProps {
  question: DescriptiveQuestion;
  index: number;
  subjectId?: string;
  unitId?: string;
}

export const DescriptiveCard = ({ question, index, subjectId, unitId }: DescriptiveCardProps) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [hasRead, setHasRead] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsOpen(false);
    setHasRead(false);
    setIsSubmitting(false);
  }, [question._id]);

  const handleToggle = async () => {
    const wasOpen = isOpen;
    setIsOpen(!isOpen);

    // If opening for the first time, record as an "attempt" (viewed)
    if (!wasOpen && !hasRead) {
      setHasRead(true);
      const timeSpent = Date.now() - startTimeRef.current;

      if (isAuthenticated) {
        setIsSubmitting(true);
        try {
          await recordAttempt({
            questionId: question._id,
            questionType: 'descriptive',
            subjectId: subjectId || question.subjectId || '',
            unitId: unitId || question.unitId || '',
            isCorrect: true, // Self-evaluated as "studied"
            timeSpent,
          });
        } catch (error) {
          console.error("Failed to record progress:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const getPlainTextAnswer = () => {
    return question.answer.map(block => {
      switch (block.type) {
        case 'list': return block.items?.map(item => `• ${item}`).join('\n') || '';
        case 'diagram':
        case 'image': return `[Image: ${block.label || block.src}]`;
        case 'heading': return `\n${block.content}\n`;
        case 'callout': return `[Note: ${block.content}]`;
        default: return block.content || '';
      }
    }).join('\n\n');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const handleCopyAnswer = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent toggling accordion when clicking copy
    try {
      await navigator.clipboard.writeText(getPlainTextAnswer());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h4 key={idx} className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"></span>
            {block.content}
          </h4>
        );

      case "subheading":
        return (
          <h5 key={idx} className="text-lg sm:text-xl font-semibold text-purple-700 dark:text-purple-300 mt-8 mb-3">
            {block.content}
          </h5>
        );

      case "text":
        return (
          <p key={idx} className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line">
            {block.content?.split(/(\*\*.*?\*\*)/g).map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i} className="font-semibold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        );

      case "list":
        return (
          <ul key={idx} className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 ml-1">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-4 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                <span className="text-purple-500 dark:text-purple-400 mt-2.5 text-[10px] shrink-0">●</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );

      case "code":
        return (
          <pre key={idx} className="mb-4 sm:mb-6 p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-inner">
            <code className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300 font-mono">{block.content}</code>
          </pre>
        );

      case "diagram":
      case "image":
        // Handle Cloudinary and other image URLs
        const imageSrc = block.src || block.content;
        const hasValidImage = imageSrc && !imageErrors[idx];

        if (hasValidImage) {
          return (
            <div key={idx} className="my-8 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-slate-800">
                <img
                  src={imageSrc}
                  alt={block.label || "Diagram"}
                  className="w-full h-auto object-contain max-h-[600px]"
                  onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                  loading="lazy"
                />
              </div>
              {block.label && (
                <p className="text-base text-center text-slate-500 dark:text-slate-400 font-medium italic">
                  {block.label}
                </p>
              )}
            </div>
          );
        }

        // Fallback if no image or image failed
        return (
          <div key={idx} className="my-8 p-6 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-2xl flex items-center gap-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
              <ImageIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide block mb-1">
                Visual Aid
              </span>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300 italic">
                {block.label || "Image not available"}
              </p>
            </div>
          </div>
        );

      case "callout":
        return (
          <div key={idx} className="my-8 p-6 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-r-2xl flex gap-4 shadow-sm">
            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-lg text-amber-800 dark:text-amber-200 font-medium italic leading-relaxed">
              {block.content}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 bg-white dark:bg-white/5 backdrop-blur-md",
        // Mobile: Edge-to-edge, no rounded corners, simple bottom border
        "border-b border-slate-200 dark:border-white/10 rounded-none shadow-none",
        // Desktop (sm+): Card look with border, rounded corners, shadow
        "sm:border sm:border-slate-200 dark:sm:border-white/10 sm:rounded-xl sm:shadow-lg",
        isOpen ? "sm:ring-2 sm:ring-purple-500/20 dark:sm:ring-purple-500/40" : "sm:hover:shadow-xl sm:hover:border-purple-200 dark:sm:hover:border-purple-500/30"
      )}
    >
      {/* Question Header - Clickable for Accordion */}
      <div
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`content-${index}`}
        className="p-3 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-pointer group select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all duration-300",
            isOpen ? "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 scale-110" : "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 group-hover:scale-105"
          )}>
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              {question.topic && (
                <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  {question.topic}
                </span>
              )}
              {/* Chevron for mobile/desktop indication */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 group-hover:text-purple-600 dark:group-hover:text-purple-300",
                isOpen && "rotate-180 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
            <h3
              id={`question-${index}-title`}
              className={cn(
                "text-base sm:text-xl font-semibold leading-snug transition-colors duration-200 max-w-prose",
                isOpen ? "text-purple-700 dark:text-purple-300" : "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300"
              )}
            >
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Answer Section - Collapsible */}
      {isOpen && (
        <div
          id={`content-${index}`}
          role="region"
          aria-labelledby={`question-${index}-title`}
          className="flex-1 bg-white dark:bg-slate-900/50 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Answer</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAnswer}
              className="h-8 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            >
              {copied ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </span>
              )}
            </Button>
          </div>

          <div className="p-3 sm:p-6 pb-6 sm:pb-10">
            {question.answer.map((block, idx) => (
              <div key={idx} className="max-w-prose">
                {renderBlock(block, idx)}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};