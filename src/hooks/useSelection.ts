import { useState, useEffect } from 'react';
import { framer, CanvasNode } from 'framer-plugin';

/**
 * Custom hook for managing Framer canvas selection
 * @returns The currently selected canvas nodes
 */
export function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([]);

    useEffect(() => {
        return framer.subscribeToSelection(setSelection);
    }, []);

    return selection;
} 