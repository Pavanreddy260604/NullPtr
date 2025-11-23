import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, RotateCcw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FillBlankQuestion } from "@/data/questionData";

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
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 border">
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            {question.topic && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground mb-2 font-medium border">
                {question.topic}
              </span>
            )}
            <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed break-words">
              {question.question}
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="ml-0 sm:ml-11 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Type your answer here (optional)..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleShowAnswer();
              }}
              className={cn(
                "flex-1 transition-colors duration-200 text-sm sm:text-base",
                hasAnswered && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                hasAnswered && !isCorrect && userAnswer.trim() !== "" && "border-red-500 bg-red-50 dark:bg-red-950/30",
                hasAnswered && isClose && "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
              )}
            />
            <Button
              onClick={handleShowAnswer}
              className="px-4 sm:px-6 whitespace-nowrap text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Answer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Answer
                </>
              )}
            </Button>
          </div>

          {/* Reset Button */}
          {hasAnswered && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* Answer Display */}
          {showAnswer && (
            <div className="p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 animate-in fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base mb-2">
                    Correct Answer:
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                    {question.correctAnswer}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mt-2">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Answer Feedback */}
          {hasAnswered && userAnswer.trim() !== "" && (
            <div className={cn(
              "p-3 sm:p-4 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-200",
              isCorrect && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
              !isCorrect && isClose && "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
              !isCorrect && !isClose && "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            )}>
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : isClose ? (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <p className={cn(
                    "font-semibold text-sm sm:text-base",
                    isCorrect && "text-green-900 dark:text-green-100",
                    !isCorrect && isClose && "text-orange-900 dark:text-orange-100",
                    !isCorrect && !isClose && "text-red-900 dark:text-red-100"
                  )}>
                    {isCorrect ? "Perfect! 🎉" :
                      isClose ? "Close! Almost there! 👍" :
                        "Nice try! Let's review this. 📚"}
                  </p>

                  <div className="space-y-1">
                    <p className={cn(
                      "text-xs sm:text-sm",
                      isClose ? "text-orange-800 dark:text-orange-200" : "text-red-800 dark:text-red-200"
                    )}>
                      <span className="font-medium">Your answer:</span> {userAnswer}
                    </p>
                  </div>

                  {isClose && (
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 italic">
                      You're on the right track! Pay attention to the specific terminology.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};