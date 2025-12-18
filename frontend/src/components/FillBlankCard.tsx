import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, RotateCcw, Eye, EyeOff, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FillBlankQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  explanation?: string;
  topic?: string;
}

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
    <Card className="flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Question Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            {question.topic && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
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
                "flex-1 h-12 text-base bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20",
                hasAnswered && isCorrect && "border-green-500 ring-1 ring-green-500/30",
                hasAnswered && !isCorrect && userAnswer.trim() !== "" && "border-red-500 ring-1 ring-red-500/30",
                hasAnswered && isClose && "border-orange-500 ring-1 ring-orange-500/30"
              )}
            />
            <Button
              onClick={handleShowAnswer}
              className={cn(
                "h-12 px-6 font-medium min-w-[140px] transition-all",
                showAnswer
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              )}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Check
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
                <><CheckCircle2 className="w-4 h-4" /> 🎉 Correct! Well done.</>
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
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-100 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                ✓ Correct Answer
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-3 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-500/20"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Reset
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                {question.correctAnswer}
              </p>
              {question.explanation && (
                <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                  <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">Explanation: </span>
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