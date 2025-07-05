'use client';

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onEscape: () => void;
}

export const useKeyboardShortcuts = ({
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onSelectAll,
  onEscape,
}: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as any)?.contentEditable === 'true'
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            onCopy();
            break;
          case 'x':
            e.preventDefault();
            onCut();
            break;
          case 'v':
            e.preventDefault();
            onPaste();
            break;
          case 'a':
            e.preventDefault();
            onSelectAll();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
            e.preventDefault();
            onDelete();
            break;
          case 'Escape':
            e.preventDefault();
            onEscape();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onCut, onPaste, onDelete, onSelectAll, onEscape]);
};