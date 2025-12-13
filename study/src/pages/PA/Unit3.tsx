import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Brain, FileText } from "lucide-react";
import { DescriptiveCard } from "@/components/DescriptiveCard";

// Importing data from the specified path
import { examData } from "../PA/PA.ts";

// --- Interfaces based on the JSON structure ---
interface QuestionPart {
    label: string;
    question: string;
    marks: number;
    answer: string;
}

interface QuestionGroup {
    question_id: number;
    marks: string;
    parts: QuestionPart[];
}

interface Unit {
    unit_number: string;
    questions: QuestionGroup[];
}

const Unit3 = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Find Unit III data from the JSON structure
    const unitData = examData.exam_content.units.find((u: any) => u.unit_number === "III");

    // 2. Flatten the data for easier searching and display
    const allQuestions = useMemo(() => {
        if (!unitData) return [];

        return unitData.questions.flatMap((group: any) =>
            group.parts.map((part: any) => ({
                id: `${group.question_id}${part.label}`, // Generates IDs like "1a", "1b", "1c"
                ...part
            }))
        );
    }, [unitData]);

    // 3. Filter logic
    const filteredQuestions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return allQuestions;

        return allQuestions.filter((q: any) =>
            q.question.toLowerCase().includes(query) ||
            q.answer.toLowerCase().includes(query) ||
            q.label.toLowerCase().includes(query)
        );
    }, [searchQuery, allQuestions]);

    if (!unitData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Unit III Not Found</h2>
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
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Predictive Modeling</div>
                                <div className="font-bold text-foreground text-sm sm:text-base leading-tight">
                                    Unit III
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-500/5 via-cyan-500/5 to-background border-b border-border/50">
                <div className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="max-w-3xl relative z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium mb-4">
                            <span className="flex w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                            {allQuestions.length} Questions
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                            Predictive Modeling & ML
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Classification, Neural Networks, and Model Assessment
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-6 sm:py-10">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search questions or keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 hover:border-blue-500/50 focus:border-blue-500 transition-all rounded-xl shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Descriptive Questions List */}
                    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                            <FileText className="w-5 h-5 text-blue-500" />
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
                                        question={{
                                            id: q.id,
                                            question: q.question,
                                            answer: [{ type: 'text', content: q.answer }]
                                        }}
                                        index={index}
                                        marks={q.marks}
                                    />

                                    {/* Visual Aid Triggers for Specific Complex Topics */}
                                    {q.id === "1c" && (
                                        <div className="my-4">
                                            [Image of decision tree example]
                                        </div>
                                    )}
                                    {q.id === "3c" && (
                                        <div className="my-4">
                                            [Image of backpropagation in neural networks]
                                        </div>
                                    )}
                                    {q.id === "5c" && (
                                        <div className="my-4">
                                            [Image of residual plots analysis]
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
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

export default Unit3;