import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordAttempt } from "@/lib/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MCQQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topic?: string;
  subjectId?: string;
  unitId?: string;
}

interface MCQCardProps {
  question: MCQQuestion;
  index: number;
  subjectId?: string;
  unitId?: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export const MCQCard = ({ question, index, subjectId, unitId, onAnswer }: MCQCardProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Reset timer if question changes (though typically questions are mapped)
  useEffect(() => {
    startTimeRef.current = Date.now();
    setHasAnswered(false);
    setSelectedOption(null);
  }, [question._id]);

  const handleOptionClick = useCallback(async (optionIndex: number) => {
    if (hasAnswered || isSubmitting) return;

    const timeSpent = Date.now() - startTimeRef.current;
    setSelectedOption(optionIndex);
    setHasAnswered(true);

    const isCorrect = optionIndex === question.correctAnswer;
    onAnswer?.(isCorrect);

    // Record progress if logged in
    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        await recordAttempt({
          questionId: question._id,
          questionType: 'mcq',
          subjectId: subjectId || question.subjectId || '',
          unitId: unitId || question.unitId || '',
          isCorrect,
          timeSpent,
          userAnswer: question.options[optionIndex]
        });
      } catch (error) {
        console.error("Failed to record progress:", error);
        // Silent fail for UX, or maybe a small toast?
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [hasAnswered, isSubmitting, question, isAuthenticated, subjectId, unitId, onAnswer]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (hasAnswered) return;

    const key = e.key;
    let newIndex = selectedOption ?? -1;

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      e.preventDefault();
      newIndex = Math.min(newIndex + 1, question.options.length - 1);
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = Math.max(newIndex - 1, 0);
    } else if (key >= '1' && key <= '4') {
      e.preventDefault();
      newIndex = parseInt(key) - 1;
    } else if (key >= 'a' && key <= 'd') {
      e.preventDefault();
      newIndex = key.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (selectedOption !== null) {
        handleOptionClick(selectedOption);
      }
      return;
    } else {
      return;
    }

    setSelectedOption(newIndex);
  }, [hasAnswered, selectedOption, question.options.length, handleOptionClick]);

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <Card className="flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Question Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-bold shadow-lg">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            {question.topic && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                {question.topic}
              </span>
            )}
            <h3
              id={`question-${index}-title`}
              className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-snug"
            >
              {question.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Interactive Body */}
      <div className="flex-1 bg-white dark:bg-slate-900/50 p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Options Grid - ARIA radiogroup for accessibility */}
        <div
          className="grid gap-3"
          role="radiogroup"
          aria-labelledby={`question-${index}-title`}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctAnswer;

            let variantStyle = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-slate-700 dark:text-slate-200";

            if (hasAnswered) {
              if (isCorrectOption) {
                variantStyle = "bg-green-50 dark:bg-green-500/20 border-green-500 ring-1 ring-green-500/50 text-green-800 dark:text-green-100";
              } else if (isSelected && !isCorrect) {
                variantStyle = "bg-red-50 dark:bg-red-500/20 border-red-500 ring-1 ring-red-500/50 text-red-800 dark:text-red-100";
              } else {
                variantStyle = "opacity-40 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500";
              }
            } else if (isSelected) {
              variantStyle = "border-violet-500 ring-1 ring-violet-500/50 bg-violet-50 dark:bg-violet-500/20 text-violet-800 dark:text-violet-100";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={hasAnswered}
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option}`}
                tabIndex={isSelected ? 0 : -1}
                className={cn(
                  "relative flex items-center gap-4 w-full p-4 text-left text-sm sm:text-base rounded-xl border transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  variantStyle
                )}
              >
                {/* Option Letter (A, B, C...) */}
                <span className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors",
                  hasAnswered && isCorrectOption ? "bg-green-500 border-green-500 text-white" :
                    hasAnswered && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                      "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-violet-100 dark:group-hover:bg-slate-700 group-hover:border-violet-400 dark:group-hover:border-violet-500"
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>

                <span className="flex-1 font-medium leading-relaxed break-words overflow-hidden">
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
              : "border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10"
          )}>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg shrink-0">
                    <HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <p className={cn(
                    "font-semibold text-base",
                    isCorrect ? "text-green-700 dark:text-green-300" : "text-violet-700 dark:text-violet-300"
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