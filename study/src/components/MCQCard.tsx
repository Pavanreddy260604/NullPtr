import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topic?: string;
}

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
    <Card className="flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Question Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-lg">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            {question.topic && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                {question.topic}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Interactive Body */}
      <div className="flex-1 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">

        {/* Options Grid */}
        <div className="grid gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctAnswer;

            let variantStyle = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-200";

            if (hasAnswered) {
              if (isCorrectOption) {
                variantStyle = "bg-green-50 dark:bg-green-500/20 border-green-500 ring-1 ring-green-500/50 text-green-800 dark:text-green-100";
              } else if (isSelected && !isCorrect) {
                variantStyle = "bg-red-50 dark:bg-red-500/20 border-red-500 ring-1 ring-red-500/50 text-red-800 dark:text-red-100";
              } else {
                variantStyle = "opacity-40 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500";
              }
            } else if (isSelected) {
              variantStyle = "border-blue-500 ring-1 ring-blue-500/50 bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-100";
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
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors",
                  hasAnswered && isCorrectOption ? "bg-green-500 border-green-500 text-white" :
                    hasAnswered && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                      "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-500"
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>

                <span className="flex-1 font-medium leading-relaxed">
                  {option}
                </span>

                {/* Status Icons */}
                {hasAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-in zoom-in" />}
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
              ? "border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10"
              : "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10"
          )}>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <p className={cn(
                    "font-semibold text-base",
                    isCorrect ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"
                  )}>
                    {isCorrect ? "🎉 Correct Answer!" : "💡 Explanation"}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {question.explanation || "Great job on attempting this question!"}
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