import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion } from "@/data/questionData";

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
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {index + 1}
          </span>
          <div className="flex-1">
            {question.topic && (
              <span className="inline-block px-2 py-1 text-xs rounded bg-accent text-accent-foreground mb-2">
                {question.topic}
              </span>
            )}
            <p className="text-base font-medium text-foreground leading-relaxed">
              {question.question}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 ml-11">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctAnswer;
            const showCorrect = hasAnswered && isCorrectOption;
            const showIncorrect = hasAnswered && isSelected && !isCorrect;

            return (
              <Button
                key={idx}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4 transition-all",
                  !hasAnswered && "hover:bg-accent hover:text-accent-foreground",
                  showCorrect && "bg-green-50 border-green-500 text-green-900 hover:bg-green-50 dark:bg-green-950 dark:text-green-100 dark:border-green-700",
                  showIncorrect && "bg-red-50 border-red-500 text-red-900 hover:bg-red-50 dark:bg-red-950 dark:text-red-100 dark:border-red-700",
                  hasAnswered && !isSelected && !isCorrectOption && "opacity-50"
                )}
                onClick={() => handleOptionClick(idx)}
                disabled={hasAnswered}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={cn(
            "ml-11 p-4 rounded-lg animate-in fade-in slide-in-from-top-2",
            isCorrect ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
          )}>
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={cn(
                  "font-semibold mb-1",
                  isCorrect ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
                )}>
                  {isCorrect ? "Correct! 🎉" : "Not quite 😅"}
                </p>
                <p className={cn(
                  "text-sm leading-relaxed",
                  isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                )}>
                  {!isCorrect && `Correct answer: ${question.options[question.correctAnswer]}\n\n`}
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};