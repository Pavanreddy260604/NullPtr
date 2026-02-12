import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, ImageIcon, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentBlock {
  type: 'text' | 'heading' | 'subheading' | 'list' | 'code' | 'callout' | 'diagram' | 'image';
  content?: string;
  items?: string[];
  label?: string;
  src?: string;
}

interface DescriptiveQuestion {
  id: string;
  question: string;
  answer: ContentBlock[];
  topic?: string;
}

interface DescriptiveCardProps {
  question: DescriptiveQuestion;
  index: number;
}

export const DescriptiveCard = ({ question, index }: DescriptiveCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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

  const handleCopyAnswer = async (e: React.MouseEvent) => {
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
          <h4 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
            {block.content}
          </h4>
        );

      case "subheading":
        return (
          <h5 key={idx} className="text-base sm:text-lg font-semibold text-purple-700 dark:text-purple-300 mt-4 mb-2">
            {block.content}
          </h5>
        );

      case "text":
        return (
          <p key={idx} className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base whitespace-pre-line">
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
          <ul key={idx} className="mb-6 space-y-2 ml-1">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <span className="text-purple-500 dark:text-purple-400 mt-2 text-xs shrink-0">●</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );

      case "code":
        return (
          <pre key={idx} className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <code className="text-sm text-emerald-700 dark:text-emerald-300 font-mono">{block.content}</code>
          </pre>
        );

      case "diagram":
      case "image":
        // Handle Cloudinary and other image URLs
        const imageSrc = block.src || block.content;
        const hasValidImage = imageSrc && !imageErrors[idx];

        if (hasValidImage) {
          return (
            <div key={idx} className="my-6 space-y-3">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-slate-800">
                <img
                  src={imageSrc}
                  alt={block.label || "Diagram"}
                  className="w-full h-auto object-contain max-h-[600px]"
                  onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                  loading="lazy"
                />
              </div>
              {block.label && (
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 font-medium italic">
                  {block.label}
                </p>
              )}
            </div>
          );
        }

        // Fallback if no image or image failed
        return (
          <div key={idx} className="my-6 p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide block mb-1">
                Visual Aid
              </span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
                {block.label || "Image not available"}
              </p>
            </div>
          </div>
        );

      case "callout":
        return (
          <div key={idx} className="my-5 p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-r-xl flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium italic leading-relaxed">
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
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-pointer group select-none"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all duration-300",
            isOpen ? "bg-gradient-to-br from-purple-600 to-pink-600 scale-110" : "bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-105"
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
            <h3 className={cn(
              "text-base sm:text-xl font-semibold leading-snug transition-colors duration-200 max-w-prose",
              isOpen ? "text-purple-700 dark:text-purple-300" : "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300"
            )}>
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Answer Section - Collapsible */}
      {isOpen && (
        <div className="flex-1 bg-white dark:bg-slate-900/50 animate-in slide-in-from-top-2 duration-200">
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

          <div className="p-4 sm:p-6 pb-8 sm:pb-10">
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