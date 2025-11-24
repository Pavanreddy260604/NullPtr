import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Brain } from "lucide-react";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { questionsData } from "@/data/questionData";

const Unit4 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const unitData = questionsData.units.find(u => u.unit === 4)!;

  const filterQuestions = (questions: any[]) => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(query) ||
      q.topic?.toLowerCase().includes(query) ||
      (q.options && q.options.some((opt: string) => opt.toLowerCase().includes(query)))
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
            <Link to="/wsma">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Units
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm text-muted-foreground">Unit 4</div>
                <div className="font-semibold text-foreground">{unitData.title}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-background py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              Unit 4
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {unitData.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {unitData.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions by keyword, topic, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="descriptive" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="descriptive" className="text-sm">
                Descriptive ({filteredDescriptive.length})
              </TabsTrigger>
              <TabsTrigger value="mcqs" className="text-sm">
                MCQs ({filteredMCQs.length})
              </TabsTrigger>
              <TabsTrigger value="fillblanks" className="text-sm">
                Fill Blanks ({filteredFillBlanks.length})
              </TabsTrigger>
            </TabsList>

            {/* Descriptive Tab */}
            <TabsContent value="descriptive" className="space-y-4">
              {filteredDescriptive.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No questions found matching "{searchQuery}"
                </div>
              ) : (
                filteredDescriptive.map((desc, index) => (
                  <DescriptiveCard key={desc.id} question={desc} index={index} />
                ))
              )}
            </TabsContent>

            {/* MCQs Tab */}
            <TabsContent value="mcqs" className="space-y-4">
              {filteredMCQs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
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
                <div className="text-center py-12 text-muted-foreground">
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
          <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <p className="text-center text-foreground font-medium">
              💪 You're getting better with every question! Keep practicing ✨
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Unit4;