import { Button } from "@/components/ui/button";
import { generateUnitPDF } from "@/lib/pdfGen";
import { FileCheck2, Hammer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const sampleData = {
    title: "Aesthetic Verification (Aesthetic Boost)",
    unit: "DEV",
    subjectName: "Design System QA",
    mcqs: [
        {
            question: "Is this airy layout more 'beautiful' than the previous strict-bordered version?",
            options: [
                "Yes, it feels more open and professional",
                "No, I preferred the boxes",
                "It's about the same",
                "I haven't checked yet"
            ],
            correctAnswer: 0,
            topic: "Instructional Design"
        }
    ],
    fillBlanks: [
        {
            question: "The divider lines now use ___ to ensure high contrast and clear separation.",
            correctAnswer: "Slate 700 / Dark Tones",
            topic: "Color Theory"
        }
    ],
    descriptives: [
        {
            question: "Explain the visual hierarchy improvements made in this version.",
            answer: [
                { type: 'heading', content: "Visual Hierarchy Strategy" },
                { type: 'text', content: "We restored the airy feel by removing strict container boxes. To prevent the layout from feeling 'weak', we reinforced the boundaries with darker divider lines and deeper text colors." },
                { type: 'subheading', content: "Key Enhancements" },
                {
                    type: 'list', items: [
                        "Restored 'Learning Card' shading for question blocks.",
                        "Slate 700 (Dark Gray) separator lines for high-impact division.",
                        "Slate 900 (Deepest Slate) typography for absolute clarity.",
                        "Slate 100 question backgrounds for subtle chunking."
                    ]
                },
                { type: 'code', content: "// Verification Snippet\nconst COLORS = {\n  BORDER: [51, 65, 85], // Hardened Dividers\n  TEXT: [15, 23, 42]    // Deepest Slate\n};" }
            ],
            topic: "Aesthetic Refinement"
        }
    ],
    options: {
        includeAnswers: true,
        includeExplanations: true
    }
};

const DevTest = () => {
    const handleTestDownload = () => {
        try {
            generateUnitPDF(sampleData as any);
            toast.success("Sample PDF Generated Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate sample PDF");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to App</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
                        <Hammer className="w-3 h-3" />
                        <span>DEVELOPMENT ENVIRONMENT</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">PDF AESTHETIC LAB</h1>
                    <p className="text-slate-400">
                        Use this hidden page to verify the "beautiful" airy layout and high-contrast Slate tones.
                        This page is not linked in the production UI.
                    </p>
                </div>

                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-bold text-emerald-500">AESTHETIC CHECKLIST</h3>
                        <ul className="text-sm space-y-1 text-slate-300">
                            <li>• Are divider lines dark enough (Slate 700)?</li>
                            <li>• Is the text contrast high enough (Slate 900)?</li>
                            <li>• Does the airy layout feel professional?</li>
                            <li>• Is the question shading visible (Slate 100 on page)?</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleTestDownload}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg"
                    >
                        <FileCheck2 className="h-5 w-5" />
                        Generate Verification Sample
                    </Button>
                </div>

                <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-4">
                    SYSTEM: PDF_GEN_ENGINE_V2_REBASED
                </div>
            </div>
        </div>
    );
};

export default DevTest;
