
import { LucideIcon } from 'lucide-react';
import { AnswerBlock } from '@/lib/api';

export type BlockType = 'text' | 'heading' | 'subheading' | 'list' | 'code' | 'callout' | 'diagram';

export interface BlockTypeConfig {
    value: BlockType;
    label: string;
    icon: LucideIcon;
    description: string;
    color: string;
    bgColor: string;
}

export interface EditorBlock extends AnswerBlock {
    id: string; // Stable UUID locally
}

export type Selection =
    | { type: 'block'; blockId: string }
    | { type: 'cursor'; blockId: string; offset?: number }
    | null;

export interface DocumentState {
    blocks: EditorBlock[];
    history: {
        past: EditorBlock[][];
        future: EditorBlock[][];
    };
    version: number;
}
