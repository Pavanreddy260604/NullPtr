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
} from '@/components/ui/popover';

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

type BlockType = typeof BLOCK_TYPES[number]['value'];

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
    const [question, setQuestion] = useState('');
    const [blocks, setBlocks] = useState<AnswerBlock[]>([]);
    const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
    const [slashMenu, setSlashMenu] = useState({ isOpen: false, blockIndex: -1, position: { top: 0, left: 0 } });

    const blockRefs = useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (initialData) {
                setQuestion(initialData.question || '');
                setBlocks(initialData.answer?.length > 0 ? initialData.answer : [{ type: 'text', content: '' }]);
            } else {
                setQuestion('');
                setBlocks([{ type: 'text', content: '' }]);
            }
            setActiveBlockIndex(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialData]);

    // Close slash menu on outside click
    useEffect(() => {
        const handleClick = () => setSlashMenu(prev => ({ ...prev, isOpen: false }));
        if (slashMenu.isOpen) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [slashMenu.isOpen]);

    const updateBlock = (index: number, val: Partial<AnswerBlock>) => {
        setBlocks(prev => prev.map((b, i) => i === index ? { ...b, ...val } : b));
    };

    const addBlock = (type: BlockType, afterIndex?: number) => {
        const newBlock: AnswerBlock = {
            type,
            content: '',
            items: type === 'list' ? [''] : undefined
        };
        const insertAt = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
        setBlocks(prev => [...prev.slice(0, insertAt), newBlock, ...prev.slice(insertAt)]);
        setTimeout(() => focusBlock(insertAt), 50);
    };

    const deleteBlock = (index: number) => {
        if (blocks.length <= 1) {
            setBlocks([{ type: 'text', content: '' }]);
        } else {
            setBlocks(prev => prev.filter((_, i) => i !== index));
            focusBlock(Math.max(0, index - 1));
        }
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;
        setBlocks(prev => {
            const newBlocks = [...prev];
            [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
            return newBlocks;
        });
        setActiveBlockIndex(newIndex);
    };

    const focusBlock = (index: number) => {
        setTimeout(() => {
            blockRefs.current[index]?.focus();
            setActiveBlockIndex(index);
        }, 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, block: AnswerBlock) => {
        // Slash command
        if (e.key === '/' && block.type === 'text' && !block.content) {
            e.preventDefault();
            const rect = blockRefs.current[index]?.getBoundingClientRect();
            if (rect) {
                setSlashMenu({
                    isOpen: true,
                    blockIndex: index,
                    position: { top: rect.bottom + 4, left: rect.left }
                });
            }
            return;
        }

        // Enter to create new block
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'list' && block.type !== 'code') {
            e.preventDefault();
            addBlock('text', index);
        }

        // Backspace to delete empty block
        if (e.key === 'Backspace' && !block.content && blocks.length > 1 &&
            block.type !== 'list' && block.type !== 'diagram') {
            e.preventDefault();
            deleteBlock(index);
        }

        // Arrow navigation
        if (e.key === 'ArrowUp' && index > 0) {
            const input = blockRefs.current[index];
            if (input && 'selectionStart' in input && input.selectionStart === 0) {
                e.preventDefault();
                focusBlock(index - 1);
            }
        }
        if (e.key === 'ArrowDown' && index < blocks.length - 1) {
            const input = blockRefs.current[index];
            if (input && 'selectionEnd' in input && input.selectionEnd === (input.value?.length || 0)) {
                e.preventDefault();
                focusBlock(index + 1);
            }
        }
    };

    const handleSlashSelect = (type: BlockType) => {
        if (slashMenu.blockIndex >= 0) {
            updateBlock(slashMenu.blockIndex, { type, content: '', items: type === 'list' ? [''] : undefined });
            focusBlock(slashMenu.blockIndex);
        }
        setSlashMenu({ isOpen: false, blockIndex: -1, position: { top: 0, left: 0 } });
    };

    const handleImageUpload = async (blockIndex: number, file: File) => {
        try {
            const sigResponse = await uploadApi.getSignature();
            const { signature, timestamp, cloudName, apiKey, folder } = sigResponse.data;
            const res = await uploadApi.directUploadToCloudinary(file, { signature, timestamp, cloudName, apiKey, folder });
            updateBlock(blockIndex, { content: res.secure_url });
        } catch (err) {
            console.error('Image upload failed:', err);
        }
    };

    const handleSave = () => {
        onSave({ question, answer: blocks });
    };

    // --- Block Renderers ---
    const renderBlock = (block: AnswerBlock, index: number) => {
        const commonInputProps = {
            ref: (el: HTMLTextAreaElement | HTMLInputElement | null) => (blockRefs.current[index] = el),
            onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index, block),
            onFocus: () => setActiveBlockIndex(index),
        };

        switch (block.type) {
            case 'heading':
                return (
                    <Input
                        {...commonInputProps}
                        value={block.content || ''}
                        onChange={e => updateBlock(index, { content: e.target.value })}
                        className="text-2xl md:text-3xl font-bold border-0 shadow-none px-0 h-auto py-1 bg-transparent focus-visible:ring-0"
                        placeholder="Heading"
                    />
                );

            case 'subheading':
                return (
                    <Input
                        {...commonInputProps}
                        value={block.content || ''}
                        onChange={e => updateBlock(index, { content: e.target.value })}
                        className="text-xl font-semibold border-0 shadow-none px-0 h-auto py-1 bg-transparent focus-visible:ring-0 text-muted-foreground"
                        placeholder="Subheading"
                    />
                );

            case 'code':
                return (
                    <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Code</span>
                        </div>
                        <Textarea
                            {...commonInputProps}
                            value={block.content || ''}
                            onChange={e => updateBlock(index, { content: e.target.value })}
                            className="font-mono text-sm bg-transparent text-slate-100 p-3 min-h-[100px] border-0 focus-visible:ring-0 resize-none"
                            placeholder="// Write code here..."
                        />
                    </div>
                );

            case 'callout':
                return (
                    <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                        <MessageSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <Textarea
                            {...commonInputProps}
                            value={block.content || ''}
                            onChange={e => updateBlock(index, { content: e.target.value })}
                            className="bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 resize-none min-h-[40px] text-amber-900 dark:text-amber-100"
                            placeholder="Write a callout..."
                        />
                    </div>
                );

            case 'list':
                return (
                    <div className="space-y-1">
                        {(block.items || ['']).map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/70 mt-2.5 shrink-0" />
                                <Input
                                    value={item}
                                    onChange={e => {
                                        const newItems = [...(block.items || [])];
                                        newItems[i] = e.target.value;
                                        updateBlock(index, { items: newItems });
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const newItems = [...(block.items || [])];
                                            newItems.splice(i + 1, 0, '');
                                            updateBlock(index, { items: newItems });
                                        }
                                        if (e.key === 'Backspace' && !item && (block.items?.length || 0) > 1) {
                                            e.preventDefault();
                                            const newItems = block.items!.filter((_, idx) => idx !== i);
                                            updateBlock(index, { items: newItems });
                                        }
                                    }}
                                    onFocus={() => setActiveBlockIndex(index)}
                                    className="border-0 shadow-none h-auto py-1 px-0 focus-visible:ring-0 bg-transparent"
                                    placeholder="List item"
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'diagram':
                return (
                    <div>
                        {block.content ? (
                            <div className="relative group rounded-lg overflow-hidden border">
                                <img src={block.content} className="max-w-full" alt="Image" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    onClick={() => updateBlock(index, { content: '' })}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Click to upload image</span>
                                <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                                />
                            </label>
                        )}
                    </div>
                );

            default: // text
                return (
                    <Textarea
                        {...commonInputProps}
                        value={block.content || ''}
                        onChange={e => updateBlock(index, { content: e.target.value })}
                        className="border-0 shadow-none px-0 py-0 bg-transparent focus-visible:ring-0 resize-none min-h-[24px] text-base leading-relaxed"
                        placeholder="Type '/' for commands, or start writing..."
                    />
                );
        }
    };

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
            <div className="flex-none border-b bg-muted/30 px-4 py-2 sticky top-14 z-10">
                <div className="max-w-2xl mx-auto flex flex-wrap gap-1">
                    {BLOCK_TYPES.map((type) => (
                        <Button
                            key={type.value}
                            variant="ghost"
                            size="sm"
                            onClick={() => addBlock(type.value)}
                            className={cn("h-8 text-xs gap-1.5", type.bgColor, "hover:opacity-80")}
                        >
                            <type.icon className={cn("w-3.5 h-3.5", type.color)} />
                            <span className="hidden sm:inline">{type.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
                    {/* Question Title */}
                    <Textarea
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        className="text-3xl md:text-4xl font-bold border-0 px-0 shadow-none resize-none bg-transparent focus-visible:ring-0 min-h-[60px] mb-6"
                        placeholder="Question title..."
                    />
                    <div className="h-px bg-border mb-6" />

                    {/* Blocks */}
                    <div className="space-y-2">
                        {blocks.map((block, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "group relative pl-10 py-1 -ml-10 rounded-sm transition-colors",
                                    activeBlockIndex === i && "bg-accent/30"
                                )}
                            >
                                {/* Gutter Controls */}
                                <div className={cn(
                                    "absolute left-0 top-1 flex items-center gap-0.5 transition-opacity",
                                    "opacity-0 group-hover:opacity-100",
                                    activeBlockIndex === i && "opacity-100"
                                )}>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-64 p-2">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1 mb-1">
                                                Add block below
                                            </div>
                                            {BLOCK_TYPES.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => addBlock(type.value, i)}
                                                    className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent text-left text-sm"
                                                >
                                                    <type.icon className={cn("w-4 h-4", type.color)} />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </PopoverContent>
                                    </Popover>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                                                <GripVertical className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            <DropdownMenuItem onClick={() => deleteBlock(i)} className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => moveBlock(i, 'up')} disabled={i === 0}>
                                                <ArrowUp className="w-4 h-4 mr-2" /> Move up
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}>
                                                <ArrowDown className="w-4 h-4 mr-2" /> Move down
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Turn into</DropdownMenuLabel>
                                            {BLOCK_TYPES.map(t => (
                                                <DropdownMenuItem
                                                    key={t.value}
                                                    onClick={() => updateBlock(i, { type: t.value, items: t.value === 'list' ? [''] : undefined })}
                                                >
                                                    <t.icon className={cn("w-4 h-4 mr-2", t.color)} />
                                                    {t.label}
                                                    {block.type === t.value && <Check className="w-3 h-3 ml-auto" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Block Content */}
                                {renderBlock(block, i)}
                            </div>
                        ))}
                    </div>

                    {/* Add Block Button */}
                    <div className="mt-6 flex justify-center">
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
                onClose={() => setSlashMenu({ isOpen: false, blockIndex: -1, position: { top: 0, left: 0 } })}
                position={slashMenu.position}
            />
        </div>
    );
};

export default DescriptiveEditor;
