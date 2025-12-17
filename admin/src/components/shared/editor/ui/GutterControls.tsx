
import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose,
} from '@/components/ui/popover';
import { BlockTypeConfig, BlockType } from '../types';

interface GutterControlsProps {
    blockId: string;
    blockType: string;
    index: number;
    totalBlocks: number;
    blockTypes: readonly BlockTypeConfig[];
    onAdd: (type: BlockType) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onChangeType: (type: BlockType) => void;
}

export const GutterControls: React.FC<GutterControlsProps> = ({
    blockType,
    index,
    totalBlocks,
    blockTypes,
    onAdd,
    onMoveUp,
    onMoveDown,
    onDelete,
    onChangeType,
}) => {
    return (
        <div className="flex items-center gap-1">
            {/* Add Block Button */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                        title="Add block below"
                        aria-label="Add block below"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1 mb-1">
                        Add block below
                    </div>
                    {blockTypes.map((type) => (
                        <PopoverClose asChild key={type.value}>
                            <button
                                onClick={() => onAdd(type.value)}
                                className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent text-left text-sm"
                            >
                                <type.icon className={cn("w-4 h-4", type.color)} />
                                {type.label}
                            </button>
                        </PopoverClose>
                    ))}
                </PopoverContent>
            </Popover>

            {/* Move Up Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                }}
                disabled={index === 0}
                className={cn(
                    "p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    index === 0
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700"
                )}
                title="Move up"
                aria-label="Move block up"
            >
                <ArrowUp className="w-4 h-4" />
            </button>

            {/* Move Down Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                }}
                disabled={index === totalBlocks - 1}
                className={cn(
                    "p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    index === totalBlocks - 1
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700"
                )}
                title="Move down"
                aria-label="Move block down"
            >
                <ArrowDown className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                disabled={totalBlocks <= 1}
                className={cn(
                    "p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1",
                    totalBlocks <= 1
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700"
                )}
                title="Delete block"
                aria-label="Delete block"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Grip / Change Type */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        title="Change block type"
                        aria-label="Block options"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Turn into</DropdownMenuLabel>
                    {blockTypes.map(t => (
                        <DropdownMenuItem
                            key={t.value}
                            onClick={() => onChangeType(t.value)}
                        >
                            <t.icon className={cn("w-4 h-4 mr-2", t.color)} />
                            {t.label}
                            {blockType === t.value && <Check className="w-3 h-3 ml-auto" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
