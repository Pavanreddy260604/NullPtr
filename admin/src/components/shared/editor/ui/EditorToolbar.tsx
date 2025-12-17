
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlockTypeConfig, BlockType } from '../types';

interface EditorToolbarProps {
    blockTypes: readonly BlockTypeConfig[];
    onAddBlock: (type: BlockType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    blockTypes,
    onAddBlock,
}) => {
    return (
        <div className="flex-none border-b bg-muted/30 px-4 py-2 sticky top-14 z-10">
            <div className="max-w-5xl mx-auto flex flex-wrap gap-1 pl-[176px]">
                {blockTypes.map((type) => (
                    <Button
                        key={type.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddBlock(type.value)}
                        className={cn("h-8 text-xs gap-1.5", type.bgColor, "hover:opacity-80")}
                    >
                        <type.icon className={cn("w-3.5 h-3.5", type.color)} />
                        <span className="hidden sm:inline">{type.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};
