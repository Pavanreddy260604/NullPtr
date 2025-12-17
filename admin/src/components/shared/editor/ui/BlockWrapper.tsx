
import React from 'react';
import { cn } from '@/lib/utils';
import { GutterControls } from './GutterControls';
import { BlockTypeConfig, BlockType } from '../types';

interface BlockWrapperProps {
    blockId: string;
    blockType: string;
    index: number;
    totalBlocks: number;
    isActive: boolean;
    blockTypes: readonly BlockTypeConfig[];
    children: React.ReactNode;
    onAdd: (type: BlockType) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onChangeType: (type: BlockType) => void;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
    blockId,
    blockType,
    index,
    totalBlocks,
    isActive,
    blockTypes,
    children,
    onAdd,
    onMoveUp,
    onMoveDown,
    onDelete,
    onChangeType,
}) => {
    return (
        <div
            className={cn(
                "group flex items-start gap-4 py-1 transition-colors relative",
                isActive && "bg-accent/30 rounded-r-sm -ml-4 pl-4" // Highlight effect adjustment
            )}
            data-block-id={blockId}
        >
            {/* Gutter (Left Column) */}
            <div className={cn(
                "shrink-0 w-[160px] flex justify-end pt-1 transition-opacity duration-200 select-none",
                "opacity-0 group-hover:opacity-100", // Show on hover
                isActive && "opacity-100",           // Show when active
                "focus-within:opacity-100"           // Show when focused
            )}>
                <GutterControls
                    blockId={blockId}
                    blockType={blockType}
                    index={index}
                    totalBlocks={totalBlocks}
                    blockTypes={blockTypes}
                    onAdd={onAdd}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onDelete={onDelete}
                    onChangeType={onChangeType}
                />
            </div>

            {/* Block Content (Right Column) */}
            <div className="flex-1 min-w-0 max-w-2xl">
                {children}
            </div>
        </div>
    );
};
