
import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockWrapperProps {
    blockId: string;
    blockType: string;
    index: number;
    totalBlocks: number;
    isActive: boolean;
    children: React.ReactNode;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
    blockId,
    blockType,
    index,
    totalBlocks,
    isActive,
    children,
    onMoveUp,
    onMoveDown,
    onDelete,
}) => {
    return (
        <div
            className={cn(
                "group py-1 transition-colors relative flex items-start gap-2",
                isActive && "bg-accent/30 rounded-sm"
            )}
            data-block-id={blockId}
        >
            {/* Block Content */}
            <div className="flex-1 max-w-2xl mx-auto">
                {children}
            </div>

            {/* Simple Control Buttons - visible on hover */}
            <div className={cn(
                "shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isActive && "opacity-100"
            )}>
                <button
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className={cn(
                        "p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        index === 0 && "opacity-30 cursor-not-allowed"
                    )}
                    title="Move up"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
                <button
                    onClick={onMoveDown}
                    disabled={index === totalBlocks - 1}
                    className={cn(
                        "p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        index === totalBlocks - 1 && "opacity-30 cursor-not-allowed"
                    )}
                    title="Move down"
                >
                    <ArrowDown className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    disabled={totalBlocks <= 1}
                    className={cn(
                        "p-1 rounded text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors",
                        totalBlocks <= 1 && "opacity-30 cursor-not-allowed"
                    )}
                    title="Delete block"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
