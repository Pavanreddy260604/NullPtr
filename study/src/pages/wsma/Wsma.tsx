import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Globe, Share2, ArrowRight, ArrowLeft, Home } from "lucide-react";

const Wsma = () => {
    const units = [
        {
            number: 3,
            title: "Sentiment Analysis",
            description: "Master the art of extracting emotions and opinions from text",
            icon: Brain,
            color: "from-blue-500 to-cyan-500",
            path: "/wsma/unit-3"
        },
        {
            number: 4,
            title: "Web Mining & Analytics",
            description: "Discover patterns and insights from web data",
            icon: Globe,
            color: "from-purple-500 to-pink-500",
            path: "/wsma/unit-4"
        },
        {
            number: 5,
            title: "Social Media Analytics",
            description: "Analyze social networks and online interactions",
            icon: Share2,
            color: "from-orange-500 to-red-500",
            path: "/wsma/unit-5"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
            {/* Header with Back Button */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="container mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Back to</span>
                                <Home className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:hidden" />
                                <span className="xs:hidden">Home</span>
                                <span className="hidden xs:inline ml-1">Subjects</span>
                            </Button>
                        </Link>

                        {/* Optional: Add title for mobile if needed */}
                        <div className="sm:hidden">
                            <span className="text-sm font-medium text-foreground">WSMA</span>
                        </div>

                        {/* Spacer for balance */}
                        <div className="w-20 sm:w-auto"></div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary mb-2 sm:mb-4 text-xs sm:text-sm">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">Interactive Platform</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        Web & Social Media Analytics
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                        Explore sentiment analysis, web mining, and social media analytics through hands-on learning experiences.
                    </p>
                </div>
            </section>

            {/* Units Grid */}
            <section className="container mx-auto px-4 pb-16 sm:pb-24">
                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8">
                        Choose Your Unit
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {units.map((unit, index) => {
                            const Icon = unit.icon;
                            return (
                                <Link key={unit.number} to={unit.path} className="group">
                                    <Card className="h-full p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${unit.color} flex items-center justify-center`}>
                                                <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                            </div>

                                            <div>
                                                <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">
                                                    Unit {unit.number}
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                    {unit.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                    {unit.description}
                                                </p>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                                            >
                                                Start Learning
                                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Wsma;