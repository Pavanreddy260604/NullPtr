import React from 'react';
import {
    Save,
    Type,
    Heading1,
    Heading2,
    List,
    Code2,
    Image as ImageIcon,
    MessageSquare,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AnswerBlock } from '@/lib/api';
import { BlockWrapper } from './editor/ui/BlockWrapper';
import { EditorToolbar } from './editor/ui/EditorToolbar';
import { BlockRenderer } from './editor/BlockRenderer';
import { BlockType } from './editor/types';
import { useEditorController } from './editor/hooks/useEditorController';

// --- Types ---
interface DescriptiveEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { question: string; answer: AnswerBlock[] }) => void;
    initialData?: {
        question: string;
        answer: AnswerBlock[];
    };
    isLoading?: boolean;
    mode: 'create' | 'edit';
}

const BLOCK_TYPES = [
    { value: 'text', label: 'Text', icon: Type, description: 'Plain text paragraph', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
    { value: 'heading', label: 'Heading 1', icon: Heading1, description: 'Large section heading', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { value: 'subheading', label: 'Heading 2', icon: Heading2, description: 'Medium heading', color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { value: 'list', label: 'Bullet List', icon: List, description: 'Bulleted list', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { value: 'code', label: 'Code', icon: Code2, description: 'Code block', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { value: 'callout', label: 'Callout', icon: MessageSquare, description: 'Highlighted note', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    { value: 'diagram', label: 'Image', icon: ImageIcon, description: 'Upload image', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
] as const;

// Ensure types match shared definition
// type BlockType = typeof BLOCK_TYPES[number]['value'];

// --- Slash Command Menu ---
const SlashMenu: React.FC<{
    isOpen: boolean;
    onSelect: (type: BlockType) => void;
    onClose: () => void;
    position: { top: number; left: number };
}> = ({ isOpen, onSelect, onClose, position }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg p-2 w-64 animate-in fade-in slide-in-from-top-2"
            style={{ top: position.top, left: position.left }}
        >
            <div className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                Block Types
            </div>
            {BLOCK_TYPES.map((type) => (
                <button
                    key={type.value}
                    onClick={() => { onSelect(type.value); onClose(); }}
                    className="flex items-center gap-3 w-full p-2 rounded hover:bg-accent text-left"
                >
                    <div className={cn("w-8 h-8 rounded flex items-center justify-center", type.bgColor)}>
                        <type.icon className={cn("w-4 h-4", type.color)} />
                    </div>
                    <div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                </button>
            ))}
        </div>
    );
};

// --- Main Component ---
const DescriptiveEditor: React.FC<DescriptiveEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isLoading = false,
    mode,
}) => {
    const {
        question, setQuestion,
        blocks,
        activeBlockId, setActiveBlockId,
        slashMenu, setSlashMenu,
        blockRefs,
        containerRef,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        handleKeyDown,
        handleSlashSelect,
        handleImageUpload,
        handleSave,
    } = useEditorController({ isOpen, initialData, onSave });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col" ref={containerRef}>
            {/* Header */}
            <header className="flex-none h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                            mode === 'create' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                            {mode}
                        </span>
                        <span className="text-muted-foreground">Descriptive Question</span>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                </Button>
            </header>

            {/* Toolbar */}
            <EditorToolbar
                blockTypes={BLOCK_TYPES}
                onAddBlock={(type) => addBlock(type)} // No index implied, appends to end or handles logic
            />

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-32">
                    {/* Question Title */}
                    <div className="flex items-start gap-4 mb-6 group">
                        {/* Title Spacer (matches gutter) - Desktop Only */}
                        <div className="shrink-0 w-[60px] hidden md:block" />

                        <div className="flex-1 relative">
                            <Textarea
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                className="text-2xl sm:text-3xl md:text-4xl font-bold border-0 px-0 shadow-none resize-none bg-transparent focus-visible:ring-0 min-h-[60px] placeholder:text-muted-foreground/30"
                                placeholder="Untitled Question"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/40 mb-6 md:ml-[76px]" />

                    {/* Blocks */}
                    <div className="space-y-2">
                        {blocks.map((block, i) => (
                            <BlockWrapper
                                key={block.id || i}
                                blockId={block.id}
                                blockType={block.type}
                                index={i}
                                totalBlocks={blocks.length}
                                isActive={activeBlockId === block.id}
                                onMoveUp={() => moveBlock(block.id, 'up')}
                                onMoveDown={() => moveBlock(block.id, 'down')}
                                onDelete={() => deleteBlock(block.id)}
                            >
                                <BlockRenderer
                                    block={block}
                                    index={i}
                                    setBlockRef={(el) => (blockRefs.current[i] = el)}
                                    updateBlock={(idx, val) => updateBlock(block.id, val)}
                                    handleKeyDown={(e, idx, blk) => handleKeyDown(e, block.id, blk)}
                                    onFocus={() => setActiveBlockId(block.id)}
                                    handleImageUpload={(idx, file) => handleImageUpload(block.id, file)}
                                />
                            </BlockWrapper>
                        ))}
                    </div>


                </div>
            </div>

            {/* Slash Menu */}
            <SlashMenu
                isOpen={slashMenu.isOpen}
                onSelect={handleSlashSelect}
                onClose={() => setSlashMenu({ isOpen: false, blockId: '', position: { top: 0, left: 0 } })}
                position={slashMenu.position}
            />
        </div >
    );
};

export default DescriptiveEditor;
