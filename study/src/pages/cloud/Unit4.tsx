import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Brain, FileText } from "lucide-react";
import { MCQCard } from "@/components/MCQCard";
import { FillBlankCard } from "@/components/FillBlankCard";
import { DescriptiveCard } from "@/components/DescriptiveCard";
import { questionsData } from "./cloud";

const Unit4c = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [htmlAvailable, setHtmlAvailable] = useState<boolean>(false);
  const [isCheckingHtml, setIsCheckingHtml] = useState<boolean>(true);

  const unitData = questionsData.units.find(u => u.unit === 4)!;

  // Check if HTML file exists
  useEffect(() => {
    const checkHtmlFile = async () => {
      try {
        setIsCheckingHtml(true);
        // Check for HTML file in the cloud directory
        const response = await fetch('/cloud/unit-4.html', { method: 'HEAD' });
        setHtmlAvailable(response.ok);
      } catch (error) {
        console.error('Error checking HTML file:', error);
        setHtmlAvailable(false);
      } finally {
        setIsCheckingHtml(false);
      }
    };

    checkHtmlFile();
  }, []);

  const filterQuestions = (questions: any[]) => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(query) ||
      q.topic?.toLowerCase().includes(query) ||
      (q.options && q.options.some((opt: string) => opt.toLowerCase().includes(query))) ||
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

  const handleViewStudyMaterial = () => {
    // Open the HTML file in a new tab
    window.open('/cloud/unit-4.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/cloud">
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
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                Unit 4
              </div>
              {htmlAvailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewStudyMaterial}
                  className="text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Study Material
                </Button>
              )}
              {isCheckingHtml && (
                <div className="inline-block px-3 py-1 rounded-full bg-gray-500/10 text-gray-600 text-sm">
                  Checking study material...
                </div>
              )}
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
                Q&A ({filteredDescriptive.length})
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
                  {searchQuery ? `No questions found matching "${searchQuery}"` : "No descriptive questions available"}
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
                  {searchQuery ? `No questions found matching "${searchQuery}"` : "No MCQ questions available"}
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
                  {searchQuery ? `No questions found matching "${searchQuery}"` : "No fill in the blanks questions available"}
                </div>
              ) : (
                filteredFillBlanks.map((fb, index) => (
                  <FillBlankCard key={fb.id} question={fb} index={index} />
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Study Material Fallback Section */}
          {!htmlAvailable && !isCheckingHtml && (
            <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Study Material Not Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  The complete study material for this unit is currently being prepared.
                  In the meantime, you can practice with the questions above.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {unitData.topics && unitData.topics.map((topic: string, index: number) => (
                    <span key={index} className="inline-block px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

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

export default Unit4c;