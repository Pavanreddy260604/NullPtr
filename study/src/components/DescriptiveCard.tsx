import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, ImageIcon, Lightbulb } from "lucide-react";
import type { DescriptiveQuestion, ContentBlock } from "@/data/questionsData";

interface DescriptiveCardProps {
  question: DescriptiveQuestion;
  index: number;
}

export const DescriptiveCard = ({ question, index }: DescriptiveCardProps) => {
  const [copied, setCopied] = useState(false);
  // State to track which images failed to load
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Helper to flatten answer for clipboard
  const getPlainTextAnswer = () => {
    return question.answer.map(block => {
      switch (block.type) {
        case 'list': return block.items.map(item => `• ${item}`).join('\n');
        case 'diagram': return `[Diagram: ${block.label}]`;
        case 'heading': return `\n${block.content}\n`;
        case 'callout': return `[Note: ${block.content}]`;
        default: return block.content;
      }
    }).join('\n\n');
  };

  const handleCopyAnswer = async () => {
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
          <h4 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 flex items-center gap-2 group">
            <span className="w-1 h-5 bg-blue-500 rounded-full opacity-80 group-hover:h-6 transition-all duration-300"></span>
            {block.content}
          </h4>
        );

      case "text":
        return (
          <p key={idx} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-line">
            {block.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
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
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-green-500 mt-2 text-[8px] shrink-0">●</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );

      // UPDATED DIAGRAM LOGIC
      case "diagram":
        // Check if we have a valid source AND it hasn't failed to load
        const showImage = block.src && !imageErrors[idx];

        if (showImage) {
          return (
            <div key={idx} className="my-6 space-y-3">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950/50">
                <img
                  src={block.src}
                  alt={block.label}
                  className="w-full h-auto object-contain max-h-[500px]"
                  onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                />
              </div>
              <p className="text-sm text-center text-slate-500 dark:text-slate-400 font-medium italic">
                Figure: {block.label}
              </p>
            </div>
          );
        }

        // Fallback: Show the Visual Aid placeholder if no image or image failed
        return (
          <div key={idx} className="my-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-white dark:bg-blue-950 rounded-md shadow-sm border border-blue-50 dark:border-blue-900">
              <ImageIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide block mb-1">
                Visual Aid
              </span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
                {block.label}
              </p>
            </div>
          </div>
        );

      case "callout":
        return (
          <div key={idx} className="my-5 p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-600 rounded-r-lg flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed">
              {block.content}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden border bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-100 dark:border-blue-800">
            {index + 1}
          </div>
          <div className="flex-1 space-y-1">
            {question.topic && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 border border-slate-200 dark:border-slate-700">
                {question.topic}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 leading-snug">
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Answer</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAnswer}
            className="h-8 px-3 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {copied ? (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCheck className="w-3.5 h-3.5" />
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                Copy
              </span>
            )}
          </Button>
        </div>

        <div className="p-5 sm:p-6">
          {question.answer.map((block, idx) => renderBlock(block, idx))}
        </div>
      </div>
    </Card>
  );
};