import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, RotateCcw, Eye, EyeOff, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FillBlankQuestion } from "@/data/questionsData";

interface FillBlankCardProps {
  question: FillBlankQuestion;
  index: number;
}

export const FillBlankCard = ({ question, index }: FillBlankCardProps) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleShowAnswer = () => {
    setShowAnswer(!showAnswer);
    if (!hasAnswered) {
      setHasAnswered(true);
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setShowAnswer(false);
    setHasAnswered(false);
  };

  const normalizeAnswer = (answer: string) => {
    return answer.toLowerCase().trim().replace(/[^\w\s]/g, "");
  };

  const isCorrect = hasAnswered && userAnswer.trim() !== "" &&
    normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);

  // Calculate similarity for partial credit
  const getSimilarity = (str1: string, str2: string) => {
    if (!str1.trim() || !str2.trim()) return 0;
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const matches = words1.filter(word => words2.includes(word)).length;
    return matches / Math.max(words1.length, words2.length);
  };

  const similarity = hasAnswered && userAnswer.trim() !== "" ? getSimilarity(userAnswer, question.correctAnswer) : 0;
  const isClose = hasAnswered && userAnswer.trim() !== "" && !isCorrect && similarity > 0.5;

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

        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Type your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleShowAnswer();
              }}
              className={cn(
                "flex-1 h-11 text-base transition-all duration-200 bg-white dark:bg-slate-950",
                hasAnswered && isCorrect && "border-green-500 ring-1 ring-green-500/20",
                hasAnswered && !isCorrect && userAnswer.trim() !== "" && "border-red-500 ring-1 ring-red-500/20",
                hasAnswered && isClose && "border-orange-500 ring-1 ring-orange-500/20"
              )}
            />
            <Button
              onClick={handleShowAnswer}
              className={cn(
                "h-11 px-6 font-medium min-w-[140px] transition-all",
                showAnswer
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
              )}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Answer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Check Answer
                </>
              )}
            </Button>
          </div>

          {/* Status/Feedback Message */}
          {hasAnswered && userAnswer.trim() !== "" && !showAnswer && (
            <div className={cn(
              "flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-1",
              isCorrect ? "text-green-600 dark:text-green-400" :
                isClose ? "text-orange-600 dark:text-orange-400" :
                  "text-red-600 dark:text-red-400"
            )}>
              {isCorrect ? (
                <><CheckCircle2 className="w-4 h-4" /> Correct! Well done.</>
              ) : isClose ? (
                <><HelpCircle className="w-4 h-4" /> Close! You're on the right track.</>
              ) : (
                <><XCircle className="w-4 h-4" /> Not quite. Try again or view the answer.</>
              )}
            </div>
          )}
        </div>

        {/* Revealed Answer Section */}
        {showAnswer && (
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-blue-100 dark:border-blue-900/50 bg-blue-100/50 dark:bg-blue-900/20">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Correct Answer
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-200/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Reset
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">
                {question.correctAnswer}
              </p>
              {question.explanation && (
                <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/50 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};