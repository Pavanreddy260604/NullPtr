import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Globe, Share2, ArrowRight } from "lucide-react";

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
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">Interactive  Platform</span>
                    </div>




                </div>
            </section>




            {/* Units Grid */}
            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-5xl mx-auto space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
                        Choose Your Unit
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {units.map((unit, index) => {
                            const Icon = unit.icon;
                            return (
                                <Link key={unit.number} to={unit.path} className="group">
                                    <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                                        <div className="space-y-4">
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${unit.color} flex items-center justify-center`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>

                                            <div>
                                                <div className="text-sm font-semibold text-muted-foreground mb-1">
                                                    Unit {unit.number}
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                    {unit.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {unit.description}
                                                </p>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                            >
                                                Start Learning
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}

        </div>
    );
};

export default Wsma;
