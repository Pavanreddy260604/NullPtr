import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { startQuiz, QuizConfig } from "@/lib/quiz";
import { toast } from "sonner";
import { Brain, Clock, Settings2, Sparkles } from "lucide-react";

interface QuizSetupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectId?: string;
    unitId?: string;
    title: string;
}

export function QuizSetupDialog({ open, onOpenChange, subjectId, unitId, title }: QuizSetupDialogProps) {
    const [config, setConfig] = useState<QuizConfig>({
        subjectId,
        unitIds: unitId ? [unitId] : [],
        questionTypes: ["mcq", "fillblank"],
        totalQuestions: 10,
        timeLimit: 600, // 10 minutes
        shuffle: true,
        difficulty: "mixed",
        negativeMarking: false
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleStartQuiz() {
        if (!subjectId || loading) return;
        setLoading(true);
        try {
            const quiz = await startQuiz(config);
            toast.success("Quiz started!");
            onOpenChange(false);
            navigate(`/quiz/${quiz.quizId}`, { state: { quiz } });
        } catch (error: any) {
            toast.error(error.message || "Failed to start quiz");
        } finally {
            setLoading(false);
        }
    }

    const toggleType = (type: string) => {
        const current = config.questionTypes || [];
        if (current.includes(type)) {
            if (current.length === 1) return; // Must have at least one
            setConfig({ ...config, questionTypes: current.filter(t => t !== type) });
        } else {
            setConfig({ ...config, questionTypes: [...current, type] });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-violet-600/10 text-violet-600 ring-1 ring-violet-600/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl">Quiz Configuration</DialogTitle>
                    </div>
                    <DialogDescription>
                        Customizing quiz for <span className="font-semibold text-foreground">{title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4 px-1">
                    {/* Questions Count */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="questions" className="text-sm font-medium flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-muted-foreground" />
                                Number of Questions
                            </Label>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{config.totalQuestions}</span>
                        </div>
                        <Input
                            id="questions"
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={config.totalQuestions}
                            onChange={(e) => setConfig({ ...config, totalQuestions: parseInt(e.target.value) })}
                            className="h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Time Limit
                            </Label>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                {config.timeLimit ? `${config.timeLimit / 60} mins` : "Unlimited"}
                            </span>
                        </div>
                        <Select
                            value={config.timeLimit?.toString() || "0"}
                            onValueChange={(val) => setConfig({ ...config, timeLimit: val === "0" ? undefined : parseInt(val) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Time Limit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Untimed</SelectItem>
                                <SelectItem value="300">5 Minutes</SelectItem>
                                <SelectItem value="600">10 Minutes</SelectItem>
                                <SelectItem value="1200">20 Minutes</SelectItem>
                                <SelectItem value="1800">30 Minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Question Types */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-muted-foreground" />
                            Question Types
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {['mcq', 'fillblank', 'descriptive'].map((type) => (
                                <div key={type}
                                    className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => toggleType(type)}
                                >
                                    <Checkbox
                                        id={`type-${type}`}
                                        checked={config.questionTypes?.includes(type)}
                                        onCheckedChange={() => toggleType(type)}
                                    />
                                    <Label
                                        htmlFor={`type-${type}`}
                                        className="text-[10px] font-medium uppercase cursor-pointer"
                                    >
                                        {type === 'descriptive' ? 'Descriptive to MCQ' : type}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-muted-foreground" />
                            Difficulty Level
                        </Label>
                        <Select
                            value={config.difficulty}
                            onValueChange={(val: any) => setConfig({ ...config, difficulty: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Shuffle & Negative Marking */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg bg-muted/30">
                            <div className="space-y-0.5 pr-2">
                                <Label htmlFor="shuffle" className="text-sm font-medium">Shuffle Questions</Label>
                                <p className="text-[10px] text-muted-foreground leading-tight">Randomize the order</p>
                            </div>
                            <Switch
                                id="shuffle"
                                checked={config.shuffle}
                                onCheckedChange={(val) => setConfig({ ...config, shuffle: val })}
                                className="data-[state=checked]:bg-violet-600"
                            />
                        </div>

                        <div className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg bg-muted/30 border-violet-500/20">
                            <div className="space-y-0.5 pr-2">
                                <Label htmlFor="negative-marking" className="text-sm font-medium">Negative Marking</Label>
                                <p className="text-[10px] text-muted-foreground leading-tight">Incorrect = deduction</p>
                            </div>
                            <Switch
                                id="negative-marking"
                                checked={config.negativeMarking}
                                onCheckedChange={(val) => setConfig({ ...config, negativeMarking: val })}
                                className="data-[state=checked]:bg-violet-600"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t p-6 bg-muted/20">
                    <Button
                        onClick={handleStartQuiz}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? "Generating Quiz..." : "Initialize Quiz Session"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
