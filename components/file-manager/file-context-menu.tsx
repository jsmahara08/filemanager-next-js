'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Edit3, 
  Download,
  Eye,
  FolderPlus
} from 'lucide-react';

interface FileContextMenuProps {
  x: number;
  y: number;
  fileId?: string;
  selectedFiles: string[];
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRename: (fileId: string, newName: string) => void;
  onCreateFolder: () => void;
  hasClipboard: boolean;
}

export const FileContextMenu = ({
  x,
  y,
  fileId,
  selectedFiles,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onCreateFolder,
  hasClipboard,
}: FileContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const hasSelection = selectedFiles.length > 0;
  const hasFileSelected = fileId && selectedFiles.includes(fileId);
  const isSingleSelection = selectedFiles.length === 1;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 bg-popover border rounded-md shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      {hasSelection && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="w-full justify-start px-3 py-2 h-auto"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCut}
            className="w-full justify-start px-3 py-2 h-auto"
          >
            <Scissors className="w-4 h-4 mr-2" />
            Cut
          </Button>
          
          <div className="h-px bg-border my-1" />
          
          {isSingleSelection && fileId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRename(fileId, '')}
              className="w-full justify-start px-3 py-2 h-auto"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full justify-start px-3 py-2 h-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </>
      )}
      
      {hasClipboard && (
        <>
          {hasSelection && <div className="h-px bg-border my-1" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPaste}
            className="w-full justify-start px-3 py-2 h-auto"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Paste
          </Button>
        </>
      )}
      
      {!hasSelection && (
        <>
          {hasClipboard && <div className="h-px bg-border my-1" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateFolder}
            className="w-full justify-start px-3 py-2 h-auto"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </>
      )}
    </div>
  );
};