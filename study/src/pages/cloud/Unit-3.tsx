import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Brain } from "lucide-react";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard"; // Import the new component
import { questionsData } from "./cloud";

const Unit3c = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const unitData = questionsData.units.find(u => u.unit === 3)!;

    const filterQuestions = (questions: any[]) => {
        if (!searchQuery.trim()) return questions;
        const query = searchQuery.toLowerCase();
        return questions.filter(q =>
            q.question.toLowerCase().includes(query) ||
            q.topic?.toLowerCase().includes(query) ||
            (q.options && q.options.some((opt: string) => opt.toLowerCase().includes(query))) ||
            // Handle searching within structured answer blocks
            (q.answer && Array.isArray(q.answer)
                ? q.answer.some((block: any) =>
                    (block.content && block.content.toLowerCase().includes(query)) ||
                    (block.items && block.items.some((item: string) => item.toLowerCase().includes(query)))
                )
                : q.answer && typeof q.answer === 'string' && q.answer.toLowerCase().includes(query)
            ) ||
            (q.correctAnswer && q.correctAnswer.toLowerCase().includes(query))
        );
    };

    const filteredMCQs = filterQuestions(unitData.mcqs);
    const filteredFillBlanks = filterQuestions(unitData.fillBlanks);
    const filteredDescriptive = filterQuestions(unitData.descriptive);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/cloud">
                            <Button variant="ghost" size="sm" className="text-sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Units
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-xs sm:text-sm text-muted-foreground">Unit 3</div>
                                <div className="font-semibold text-foreground text-sm sm:text-base">{unitData.title}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-background py-8 sm:py-12 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                            Unit 3
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                            {unitData.title}
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground">
                            {unitData.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-6 sm:py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Search */}
                    <div className="mb-4 sm:mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search questions by keyword, topic, or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="descriptive" className="space-y-4 sm:space-y-6">
                        <TabsList className="grid w-full grid-cols-3 p-1 sm:p-2">
                            <TabsTrigger value="descriptive" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                                Q&A ({filteredDescriptive.length})
                            </TabsTrigger>
                            <TabsTrigger value="mcqs" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                                MCQs ({filteredMCQs.length})
                            </TabsTrigger>
                            <TabsTrigger value="fillblanks" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                                Fill Blanks ({filteredFillBlanks.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Descriptive Tab */}
                        <TabsContent value="descriptive" className="space-y-4 sm:space-y-6">
                            {filteredDescriptive.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
                                    No questions found matching "{searchQuery}"
                                </div>
                            ) : (
                                filteredDescriptive.map((desc, index) => (
                                    // Updated to use the DescriptiveCard component directly
                                    <DescriptiveCard key={desc.id} question={desc} index={index} />
                                ))
                            )}
                        </TabsContent>

                        {/* MCQs Tab */}
                        <TabsContent value="mcqs" className="space-y-4">
                            {filteredMCQs.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
                                    No questions found matching "{searchQuery}"
                                </div>
                            ) : (
                                filteredMCQs.map((mcq, index) => (
                                    <MCQCard key={mcq.id} question={mcq} index={index} />
                                ))
                            )}
                        </TabsContent>

                        {/* Fill Blanks Tab */}
                        <TabsContent value="fillblanks" className="space-y-4">
                            {filteredFillBlanks.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
                                    No questions found matching "{searchQuery}"
                                </div>
                            ) : (
                                filteredFillBlanks.map((fb, index) => (
                                    <FillBlankCard key={fb.id} question={fb} index={index} />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Encouragement */}
                    <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <p className="text-center text-foreground font-medium text-base sm:text-lg">
                            💪 You're getting better with every question! Keep practicing ✨
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Unit3c;