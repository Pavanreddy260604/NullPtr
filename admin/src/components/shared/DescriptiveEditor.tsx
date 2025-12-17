import React, { useState, useEffect, useRef } from 'react';
import {
    Save,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Type,
    Heading1,
    Heading2,
    List,
    Code2,
    Image as ImageIcon,
    MessageSquare,
    GripVertical,
    ChevronLeft,
    Check,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AnswerBlock, uploadApi } from '@/lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose,
} from '@/components/ui/popover';
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
        activeBlockId, setActiveBlockId, // Updated destructuring
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
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
                    {/* Question Title */}
                    <div className="flex items-start gap-4 mb-6 group">
                        {/* Title Spacer (matches gutter) */}
                        <div className="shrink-0 w-[160px]" />

                        <div className="flex-1 max-w-2xl relative">
                            <Textarea
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                className="text-3xl md:text-4xl font-bold border-0 px-0 shadow-none resize-none bg-transparent focus-visible:ring-0 min-h-[60px]"
                                placeholder="Question title..."
                            />
                        </div>
                    </div>
                    <div className="h-px bg-border mb-6 ml-[176px] max-w-2xl" />

                    {/* Blocks */}
                    <div className="space-y-2">
                        {blocks.map((block, i) => (
                            <BlockWrapper
                                key={block.id || i} // Use ID for key! Fallback to i only if hydration fails (shouldn't happen)
                                blockId={block.id}
                                blockType={block.type}
                                index={i} // Still useful for UI numbering if needed
                                totalBlocks={blocks.length}
                                isActive={activeBlockId === block.id} // Explicit Selection
                                blockTypes={BLOCK_TYPES}
                                onAdd={(type) => addBlock(type, block.id)} // Pass ID
                                onMoveUp={() => moveBlock(block.id, 'up')} // Pass ID
                                onMoveDown={() => moveBlock(block.id, 'down')} // Pass ID
                                onDelete={() => deleteBlock(block.id)} // Pass ID
                                onChangeType={(type) => updateBlock(block.id, { type: type, items: type === 'list' ? [''] : undefined })} // Pass ID
                            >
                                <BlockRenderer
                                    block={block}
                                    index={i} // Index for Ref Array (Legacy Ref support)
                                    setBlockRef={(el) => (blockRefs.current[i] = el)}
                                    // Wrappers for ID-based logic
                                    updateBlock={(idx, val) => updateBlock(block.id, val)}
                                    handleKeyDown={(e, idx, blk) => handleKeyDown(e, block.id, blk)}
                                    onFocus={() => setActiveBlockId(block.id)} // Explicit Set
                                    handleImageUpload={(idx, file) => handleImageUpload(block.id, file)}
                                />
                            </BlockWrapper>
                        ))}
                    </div>

                    {/* Add Block Button */}
                    <div className="mt-6 flex justify-center ml-[160px] max-w-2xl">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="text-muted-foreground">
                                    <Plus className="w-4 h-4 mr-2" /> Add block
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                                {BLOCK_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => addBlock(type.value)}
                                        className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent text-left text-sm"
                                    >
                                        <type.icon className={cn("w-4 h-4", type.color)} />
                                        {type.label}
                                    </button>
                                ))}
                            </PopoverContent>
                        </Popover>
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
