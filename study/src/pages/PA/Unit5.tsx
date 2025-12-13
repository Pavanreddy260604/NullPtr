import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Brain, FileText, ShieldCheck } from "lucide-react";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { examData } from "../PA/PA.ts";

// --- Interfaces matching the examData structure ---
interface ContentBlock {
  type: 'text' | 'heading' | 'list' | 'callout';
  content?: string;
  items?: string[];
}

interface DescriptiveQuestion {
  id: string;
  question: string;
  answer: ContentBlock[];
  topic?: string;
}

const Unit5 = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Find Unit 5 data directly from the units array
  // Note: Data uses 'unit: 5' (number), not 'unit_number: "V"'
  const unitData = examData.units.find((u: any) => u.unit === 5);

  // 2. Data is already flattened in the 'descriptive' array in your PA.ts
  const allQuestions = useMemo(() => {
    if (!unitData || !unitData.descriptive) return [];
    return unitData.descriptive;
  }, [unitData]);

  // 3. Filter logic updated for ContentBlock structure
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allQuestions;

    return allQuestions.filter((q: any) => {
      const matchesQuestion = q.question.toLowerCase().includes(query);
      const matchesTopic = q.topic?.toLowerCase().includes(query);

      // Search inside the structured answer blocks
      const matchesAnswer = q.answer.some((block: any) => {
        if (block.content) return block.content.toLowerCase().includes(query);
        if (block.items) return block.items.some((item: string) => item.toLowerCase().includes(query));
        return false;
      });

      return matchesQuestion || matchesTopic || matchesAnswer;
    });
  }, [searchQuery, allQuestions]);

  if (!unitData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Unit V Not Found</h2>
          <p className="text-muted-foreground mb-4">Check your data source (PA.ts)</p>
          <Link to="/"><Button>Go Back</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-sm hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Units</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-right">
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Predictive Modeling</div>
                <div className="font-bold text-foreground text-sm sm:text-base leading-tight">
                  Unit V
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-500/5 via-pink-500/5 to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium mb-4">
              <span className="flex w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              {allQuestions.length} Questions
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {unitData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {unitData.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 hover:border-purple-500/50 focus:border-purple-500 transition-all rounded-xl shadow-sm"
              />
            </div>
          </div>

          {/* Descriptive Questions List */}
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Descriptive Questions</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {filteredQuestions.length} results
              </span>
            </div>

            {filteredQuestions.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              filteredQuestions.map((q: any, index: number) => (
                <div key={q.id} className="space-y-4">
                  <DescriptiveCard
                    question={q} // Passing the full question object which now includes structured 'answer'
                    index={index}
                  />

                  {/* Visual Aid for Shared Responsibility Model (Q: u5-1c based on your data) */}
                  {q.id.includes("1c") && (
                    <div className="my-4">
                      [Image of Cloud Shared Responsibility Model]
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Encouragement */}
          <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-center text-foreground font-medium">
              💪 You're getting better with every question! Keep practicing ✨
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper component for empty states
const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">No questions found</h3>
    <p className="text-muted-foreground max-w-sm">
      We couldn't find any questions matching "{query}".
    </p>
  </div>
);

export default Unit5;