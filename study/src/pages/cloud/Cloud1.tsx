import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Server, Cloud, Shield, ArrowRight, ArrowLeft } from "lucide-react";

const Cloud1 = () => {
    const units = [
        {
            number: 3,
            title: "Virtualization and Cloud Programming",
            description: "Master virtualization technologies and cloud application development",
            icon: Server,
            color: "from-blue-500 to-cyan-500",
            path: "/cloud/unit-3"
        },
        {
            number: 4,
            title: "Data Centers and Cloud Providers",
            description: "Explore infrastructure, networking, and major cloud platforms",
            icon: Cloud,
            color: "from-purple-500 to-pink-500",
            path: "/cloud/unit-4"
        },
        {
            number: 5,
            title: "Cloud Security and Management",
            description: "Learn security governance, load balancing, and cloud operations",
            icon: Shield,
            color: "from-orange-500 to-red-500",
            path: "/cloud/unit-5"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
            {/* Header with Back Button */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Subjects
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">Interactive Platform</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        Cloud Computing
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Master cloud technologies, virtualization, and distributed systems through interactive learning.
                    </p>
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
        </div>
    );
};

export default Cloud1;