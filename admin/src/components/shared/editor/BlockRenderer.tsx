
import React from 'react';
import { MessageSquare, ImageIcon, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnswerBlock } from '@/lib/api';
import { BlockType, EditorBlock } from './types';

interface BlockRendererProps {
    block: EditorBlock;
    index: number;
    // We pass refs callback instead of ref object
    setBlockRef: (el: HTMLTextAreaElement | HTMLInputElement | null) => void;
    updateBlock: (index: number, updates: Partial<AnswerBlock>) => void;
    handleKeyDown: (e: React.KeyboardEvent, index: number, block: EditorBlock) => void;
    onFocus: () => void;
    handleImageUpload: (index: number, file: File) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    index,
    setBlockRef,
    updateBlock,
    handleKeyDown,
    onFocus,
    handleImageUpload,
}) => {
    const commonInputProps = {
        ref: setBlockRef,
        onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index, block),
        onFocus: onFocus,
    };

    switch (block.type as BlockType) {
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
                                onFocus={onFocus}
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

export default React.memo(BlockRenderer);
