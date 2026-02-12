import { jsPDF } from "jspdf";

export interface PDFQuestion {
    question: string;
    topic?: string;
    answer?: any[] | string;
    type?: 'mcq' | 'fb' | 'desc';
    options?: string[];
    correctAnswer?: string | number;
}

export interface PDFUnitData {
    title: string;
    unit: string | number;
    subjectName: string;
    mcqs: PDFQuestion[];
    fillBlanks: PDFQuestion[];
    descriptives: PDFQuestion[];
    options?: {
        includeAnswers: boolean;
        includeExplanations: boolean;
    }
}

export const generateUnitPDF = (data: PDFUnitData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - margin) {
            doc.addPage();
            y = margin;
            addPageHeader();
        }
    };

    const addPageHeader = () => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`NullPtr Study Guide - ${data.subjectName}`, margin, 10);
        const pageNum = (doc as any).internal.getNumberOfPages() || 1;
        doc.text(`Page ${pageNum}`, pageWidth - margin - 15, 10);
        doc.setDrawColor(240, 240, 240);
        doc.line(margin, 12, pageWidth - margin, 12);
    };

    // --- Cover / Main Header ---
    addPageHeader();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(100, 50, 200); // Purple NullPtr Brand
    const title = `${data.subjectName}`;
    doc.text(title, margin, y + 10);

    y += 20;
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text(`Unit ${data.unit}: ${data.title}`, margin, y);

    y += 10;
    doc.setDrawColor(100, 50, 200);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + 40, y);
    y += 15;

    const renderSection = (title: string, questions: PDFQuestion[]) => {
        if (!questions || questions.length === 0) return;

        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.setFillColor(245, 245, 250);
        doc.rect(margin, y - 5, contentWidth, 10, 'F');
        doc.text(title, margin + 5, y + 2);
        y += 15;

        questions.forEach((q, idx) => {
            // Question Text
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, contentWidth);
            checkPageBreak(qLines.length * 7 + 10);
            doc.text(qLines, margin, y);
            y += (qLines.length * 7) + 2;

            // Optional Topic
            if (q.topic) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(9);
                doc.setTextColor(120, 120, 120);
                doc.text(`Topic: ${q.topic}`, margin, y);
                y += 6;
            }

            // Options (for MCQs)
            if (q.options && q.options.length > 0) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                q.options.forEach((opt, oIdx) => {
                    const char = String.fromCharCode(65 + oIdx);
                    checkPageBreak(10);
                    doc.text(`${char}) ${opt}`, margin + 5, y);
                    y += 6;
                });
                y += 2;
            }

            // Answer Content (Block-elements)
            if (q.answer && Array.isArray(q.answer)) {
                q.answer.forEach(block => {
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(60, 60, 60);

                    switch (block.type) {
                        case 'heading':
                            y += 4;
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(11);
                            checkPageBreak(10);
                            doc.text(block.content, margin, y);
                            y += 7;
                            break;
                        case 'subheading':
                            y += 2;
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(10);
                            checkPageBreak(8);
                            doc.text(block.content, margin, y);
                            y += 6;
                            break;
                        case 'text':
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(10);
                            const textLines = doc.splitTextToSize(block.content, contentWidth);
                            checkPageBreak(textLines.length * 6 + 5);
                            doc.text(textLines, margin, y);
                            y += (textLines.length * 6) + 2;
                            break;
                        case 'list':
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(10);
                            block.items.forEach((item: string) => {
                                const itemLines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
                                checkPageBreak(itemLines.length * 6 + 2);
                                doc.text(itemLines, margin + 5, y);
                                y += (itemLines.length * 6);
                            });
                            y += 2;
                            break;
                        case 'code':
                            // ASCII Diagrams / Code Blocks
                            doc.setFont("courier", "normal");
                            doc.setFontSize(9);
                            doc.setTextColor(80, 80, 80);
                            const codeLines = block.content.split('\n');
                            const boxHeight = (codeLines.length * 5) + 4;
                            checkPageBreak(boxHeight + 5);

                            // Light gray background box for diagrams
                            doc.setFillColor(248, 248, 248);
                            doc.rect(margin, y - 4, contentWidth, boxHeight, 'F');
                            doc.setDrawColor(230, 230, 230);
                            doc.rect(margin, y - 4, contentWidth, boxHeight, 'D');

                            codeLines.forEach((line: string) => {
                                doc.text(line, margin + 4, y);
                                y += 5;
                            });
                            y += 4;
                            break;
                    }
                });
            } else if (q.correctAnswer !== undefined) {
                // MCQ or FB Correct Answer
                if (data.options?.includeAnswers) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.setTextColor(34, 197, 94); // Green accent
                    const ansText = q.type === 'mcq'
                        ? `Correct Option: ${String.fromCharCode(64 + (Number(q.correctAnswer) + 1))}`
                        : `Answer: ${q.correctAnswer}`;

                    checkPageBreak(10);
                    doc.text(ansText, margin, y);
                    y += 8;
                }
            } else if (typeof q.answer === 'string' && q.answer) {
                // Simple string answer
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                const ansLines = doc.splitTextToSize(`Ans: ${q.answer}`, contentWidth);
                checkPageBreak(ansLines.length * 6 + 5);
                doc.text(ansLines, margin, y);
                y += (ansLines.length * 6) + 4;
            }

            y += 8; // Spacer between questions
            doc.setDrawColor(245, 245, 245);
            doc.line(margin, y - 4, pageWidth - margin, y - 4);
        });

        y += 10;
    };

    renderSection("Section A: Multiple Choice Questions", data.mcqs);
    renderSection("Section B: Fill in the Blanks", data.fillBlanks);
    renderSection("Section C: Descriptive Questions", data.descriptives);

    doc.save(`${data.subjectName}_Unit${data.unit}_StudyGuide.pdf`);
};
