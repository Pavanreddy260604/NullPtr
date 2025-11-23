import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion } from "@/data/questionsData";

interface MCQCardProps {
  question: MCQQuestion;
  index: number;
}

export const MCQCard = ({ question, index }: MCQCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
    setHasAnswered(true);
  };

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <Card className="flex flex-col overflow-hidden border bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Question Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-100 dark:border-blue-800">
            {index + 1}
          </div>
          <div className="flex-1 space-y-1">
            {question.topic && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 border border-slate-200 dark:border-slate-700">
                {question.topic}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 leading-snug">
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Interactive Body */}
      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/20 p-5 sm:p-6 space-y-6">

        {/* Options Grid */}
        <div className="grid gap-3 sm:grid-cols-1">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctAnswer;

            // Determine state for styling
            let variantStyle = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10";

            if (hasAnswered) {
              if (isCorrectOption) {
                variantStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 ring-1 ring-green-500 text-green-900 dark:text-green-100";
              } else if (isSelected && !isCorrect) {
                variantStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 ring-1 ring-red-500 text-red-900 dark:text-red-100";
              } else {
                variantStyle = "opacity-50 grayscale border-transparent bg-slate-100 dark:bg-slate-900";
              }
            } else if (isSelected) {
              variantStyle = "border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={hasAnswered}
                className={cn(
                  "relative flex items-center gap-4 w-full p-4 text-left text-sm sm:text-base rounded-xl border transition-all duration-200 group",
                  variantStyle
                )}
              >
                {/* Option Letter (A, B, C...) */}
                <span className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                  hasAnswered && isCorrectOption ? "bg-green-600 border-green-600 text-white" :
                    hasAnswered && isSelected && !isCorrect ? "bg-red-600 border-red-600 text-white" :
                      "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700"
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>

                <span className="flex-1 font-medium leading-relaxed">
                  {option}
                </span>

                {/* Status Icons */}
                {hasAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-in zoom-in spin-in-12" />}
                {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 animate-in zoom-in" />}
              </button>
            );
          })}
        </div>

        {/* Explanation / Feedback Box */}
        {hasAnswered && (
          <div className={cn(
            "rounded-xl border overflow-hidden animate-in fade-in slide-in-from-top-2",
            isCorrect
              ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10"
              : "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10"
          )}>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <p className={cn(
                    "font-semibold text-base",
                    isCorrect ? "text-green-900 dark:text-green-100" : "text-slate-900 dark:text-slate-100"
                  )}>
                    {isCorrect ? "Correct Answer!" : "Explanation"}
                  </p>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};