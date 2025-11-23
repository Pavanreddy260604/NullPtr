import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DescriptiveQuestion } from "@/data/questionData";

interface DescriptiveCardProps {
  question: DescriptiveQuestion;
  index: number;
}

export const DescriptiveCard = ({ question, index }: DescriptiveCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(question.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatAnswer = (answer: string) => {
    return answer.split('\n\n').map((paragraph, idx) => {
      // Handle bullet points and numbered lists
      if (paragraph.startsWith('•') || paragraph.match(/^\d+\./) || paragraph.startsWith('-')) {
        return (
          <div key={idx} className="space-y-3">
            {paragraph.split('\n').map((line, lineIdx) => (
              <div key={lineIdx} className="flex items-start gap-3">
                {(line.startsWith('•') || line.startsWith('-')) && (
                  <>
                    <span className="text-green-600 mt-1 flex-shrink-0 text-lg">•</span>
                    <p className="text-foreground leading-relaxed flex-1 text-base">
                      {line.substring(1).trim()}
                    </p>
                  </>
                )}
                {line.match(/^\d+\./) && (
                  <p className="text-foreground leading-relaxed text-base">
                    {line}
                  </p>
                )}
                {!line.startsWith('•') && !line.startsWith('-') && !line.match(/^\d+\./) && line.trim() && (
                  <p className="text-foreground leading-relaxed ml-6 text-base">
                    {line}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }

      // Handle bold text (***text***)
      if (paragraph.includes('***')) {
        const parts = paragraph.split('***');
        return (
          <p key={idx} className="text-foreground leading-relaxed whitespace-pre-line text-base">
            {parts.map((part, partIdx) =>
              partIdx % 2 === 1 ? (
                <strong key={partIdx} className="font-semibold text-foreground">{part}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      // Regular paragraphs
      return (
        <p key={idx} className="text-foreground leading-relaxed whitespace-pre-line text-base">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 border">
      <div className="space-y-4">
        {/* Question Section */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            {question.topic && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20 mb-2">
                {question.topic}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed break-words">
              {question.question}
            </h3>
          </div>
        </div>

        {/* Answer Section - Always Visible */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 sm:mt-1">
                <span className="text-green-600 text-xs sm:text-sm font-bold">A</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="text-foreground leading-relaxed">
                  {formatAnswer(question.answer)}
                </div>

                {/* Copy Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAnswer}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        Copy Answer
                      </>
                    )}
                  </Button>
                </div>

                {/* Copy success message */}
                {copied && (
                  <div className="flex items-center gap-2 text-xs text-green-600 animate-in fade-in">
                    <CheckCheck className="w-3 h-3" />
                    Answer copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};