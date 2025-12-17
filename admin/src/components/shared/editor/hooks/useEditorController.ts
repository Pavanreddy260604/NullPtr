
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnswerBlock, uploadApi } from '@/lib/api';
import { BlockType, EditorBlock } from '../types';
import { generateId } from '../utils';

interface UseEditorControllerProps {
    isOpen: boolean;
    initialData?: {
        question: string;
        answer: AnswerBlock[];
    };
    onSave: (data: { question: string; answer: AnswerBlock[] }) => void;
}

export const useEditorController = ({
    isOpen,
    initialData,
    onSave,
}: UseEditorControllerProps) => {
    const [question, setQuestion] = useState('');
    const [blocks, setBlocks] = useState<EditorBlock[]>([]);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [slashMenu, setSlashMenu] = useState({ isOpen: false, blockId: '', position: { top: 0, left: 0 } });

    // We keep blockRefs for focus management, but mapped by ID would be ideal.
    // However, since we are using array index for refs array in BlockRenderer (legacy ref pattern),
    // we might need to stick to index-based Ref assignment in the Renderer, but Logic is ID based.
    // Ideally, we move to Map<string, HTMLElement> refs.
    // For "Pragmatic" refactor, let's Map ID to Index when needed for refs, OR switch to ID refs.
    // Switching to ID refs requires changing BlockRenderer.
    // Let's stick to simple Ref Array for now, but look up by index found via ID.
    const blockRefs = useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize & Hydrate
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (initialData) {
                setQuestion(initialData.question || '');
                const initialBlocks = initialData.answer?.length > 0 ? initialData.answer : [{ type: 'text', content: '' }];
                // Hydrate with IDs
                setBlocks(initialBlocks.map(b => ({ ...b, id: generateId() } as EditorBlock)));
            } else {
                setQuestion('');
                setBlocks([{ type: 'text', content: '', id: generateId() } as EditorBlock]);
            }
            setActiveBlockId(null);
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

    // Focus Utility
    const focusBlock = useCallback((id: string) => {
        // Find index to get ref
        // In a perfect world, we use a Map ref.
        setTimeout(() => {
            const index = blocks.findIndex(b => b.id === id); // NOTE: blocks is stale in callback?
            // Wait, blocks dependency needed?
            // To access latest 'blocks', we might need to pass it or use ref.
            // But we can find the index in the Render cycle using useEffect?
            // No, focusBlock is called imperatively.

            // Hack/Workaround: We need the LATEST blocks to find the index.
            // But 'focusBlock' is often called after setBlocks.
            // The Ref pattern is tricky here without Ref-based ID map.
            // Let's rely on `activeBlockId` effect?
            setActiveBlockId(id);
        }, 10);
    }, [blocks]); // Dependency on blocks ensures we see new indices.

    // Better Focus Effect: When activeBlockId changes, focus that ref.
    useEffect(() => {
        if (activeBlockId) {
            const index = blocks.findIndex(b => b.id === activeBlockId);
            if (index !== -1 && blockRefs.current[index]) {
                blockRefs.current[index]?.focus();
            }
        }
    }, [activeBlockId, blocks]);

    const updateBlock = useCallback((id: string, val: Partial<AnswerBlock>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...val } : b));
    }, []);

    const addBlock = useCallback((type: BlockType, afterId?: string) => {
        const newId = generateId();
        setBlocks(prev => {
            const newBlock: EditorBlock = {
                type,
                content: '',
                items: type === 'list' ? [''] : undefined,
                id: newId
            };

            if (!afterId) {
                return [...prev, newBlock];
            }

            const index = prev.findIndex(b => b.id === afterId);
            if (index === -1) return [...prev, newBlock];

            const newBlocks = [...prev];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });
        // Select the new block
        setTimeout(() => setActiveBlockId(newId), 0);
    }, []);

    const deleteBlock = useCallback((id: string) => {
        setBlocks(prev => {
            if (prev.length <= 1) {
                // Empty Policy
                return [{ type: 'text', content: '', id: generateId() } as EditorBlock];
            }

            // Find predecessor for focus
            const index = prev.findIndex(b => b.id === id);
            let nextActiveId = null;
            if (index > 0) nextActiveId = prev[index - 1].id;
            else if (index < prev.length - 1) nextActiveId = prev[index + 1].id;

            if (nextActiveId) setTimeout(() => setActiveBlockId(nextActiveId), 0);

            return prev.filter(b => b.id !== id);
        });
    }, []);

    const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            const index = prev.findIndex(b => b.id === id);
            if (index === -1) return prev;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newBlocks = [...prev];
            [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
            return newBlocks;
        });
        // Focus follows
        setTimeout(() => setActiveBlockId(id), 0);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string, block: EditorBlock) => {
        // Slash command
        if (e.key === '/' && block.type === 'text' && !block.content) {
            e.preventDefault();
            const index = blocks.findIndex(b => b.id === id);
            const rect = blockRefs.current[index]?.getBoundingClientRect();
            if (rect) {
                setSlashMenu({
                    isOpen: true,
                    blockId: id,
                    position: { top: rect.bottom + 4, left: rect.left }
                });
            }
            return;
        }

        // Enter to create new block
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'list' && block.type !== 'code') {
            e.preventDefault();
            addBlock('text', id);
        }

        // Backspace to delete empty block
        // Guard: Don't delete if it's the only one (handled by deleteBlock logic but UI check good too)
        if (e.key === 'Backspace' && !block.content && blocks.length > 1 &&
            block.type !== 'list' && block.type !== 'diagram') {
            e.preventDefault();
            deleteBlock(id);
        }

        // Arrow navigation
        if (e.key === 'ArrowUp') {
            const index = blocks.findIndex(b => b.id === id);
            if (index > 0) {
                const input = blockRefs.current[index];
                if (input && 'selectionStart' in input && input.selectionStart === 0) {
                    e.preventDefault();
                    setActiveBlockId(blocks[index - 1].id);
                }
            }
        }
        if (e.key === 'ArrowDown') {
            const index = blocks.findIndex(b => b.id === id);
            if (index < blocks.length - 1) {
                const input = blockRefs.current[index];
                if (input && 'selectionEnd' in input && input.selectionEnd === (input.value?.length || 0)) {
                    e.preventDefault();
                    setActiveBlockId(blocks[index + 1].id);
                }
            }
        }
    }, [blocks, addBlock, deleteBlock]);

    const handleSlashSelect = useCallback((type: BlockType) => {
        setSlashMenu(prev => {
            if (prev.blockId) {
                updateBlock(prev.blockId, { type, content: '', items: type === 'list' ? [''] : undefined });
                setTimeout(() => setActiveBlockId(prev.blockId), 0);
            }
            return { isOpen: false, blockId: '', position: { top: 0, left: 0 } };
        });
    }, [updateBlock]);

    const handleImageUpload = useCallback(async (blockId: string, file: File) => {
        try {
            const sigResponse = await uploadApi.getSignature();
            const { signature, timestamp, cloudName, apiKey, folder } = sigResponse.data;
            const res = await uploadApi.directUploadToCloudinary(file, { signature, timestamp, cloudName, apiKey, folder });

            // Async Safety Guard: Verify block still matches expectations (ID match is implicit in Map)
            // But we verify type to be safe?
            setBlocks(prev => prev.map(b =>
                b.id === blockId && b.type === 'diagram' // Ensure it's still a diagram and same block
                    ? { ...b, content: res.secure_url }
                    : b
            ));
        } catch (err) {
            console.error('Image upload failed:', err);
        }
    }, []);

    const handleSave = useCallback(() => {
        // Serialize: Remove IDs
        const serializedAnswers = blocks.map(({ id, ...rest }) => rest);
        onSave({ question, answer: serializedAnswers });
    }, [question, blocks, onSave]);

    return {
        question, setQuestion,
        blocks, setBlocks,
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
    };
};
