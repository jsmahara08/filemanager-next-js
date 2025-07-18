'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileItem } from '@/types/file-manager';

interface FileModalsProps {
  modals: {
    rename: boolean;
    createFolder: boolean;
    delete: boolean;
    move: boolean;
  };
  onCreateFolder: (name: string) => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onClose: (modalType: keyof FileModalsProps['modals']) => void;
  selectedFiles: string[];
  renameFile?: FileItem;
}

export const FileModals = ({
  modals,
  onCreateFolder,
  onRename,
  onDelete,
  onClose,
  selectedFiles,
  renameFile,
}: FileModalsProps) => {
  const [folderName, setFolderName] = useState('New Folder');
  const [fileName, setFileName] = useState('');

  // Set initial rename value when modal opens
  useEffect(() => {
    if (modals.rename && renameFile) {
      setFileName(renameFile.name);
    }
  }, [modals.rename, renameFile]);

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('New Folder');
    }
  };

  const handleRename = () => {
    if (fileName.trim() && fileName.trim() !== renameFile?.name) {
      onRename(fileName.trim());
      setFileName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Rename Modal */}
      <Dialog open={modals.rename} onOpenChange={() => onClose('rename')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {renameFile?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">New Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => handleKeyDown(e, handleRename)}
                autoFocus
                onFocus={(e) => {
                  // Select filename without extension for files
                  if (renameFile?.type === 'file' && renameFile.extension) {
                    const nameWithoutExt = renameFile.name.replace(`.${renameFile.extension}`, '');
                    e.target.setSelectionRange(0, nameWithoutExt.length);
                  } else {
                    e.target.select();
                  }
                }}
              />
              {renameFile && (
                <p className="text-xs text-muted-foreground">
                  Current name: {renameFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onClose('rename')}>
                Cancel
              </Button>
              <Button 
                onClick={handleRename} 
                disabled={!fileName.trim() || fileName.trim() === renameFile?.name}
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={modals.createFolder} onOpenChange={() => onClose('createFolder')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => handleKeyDown(e, handleCreateFolder)}
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onClose('createFolder')}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={modals.delete} onOpenChange={() => onClose('delete')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selectedFiles.length === 1 ? 'Item' : 'Items'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {selectedFiles.length === 1 ? 'this item' : `these ${selectedFiles.length} items`}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onClose('delete')}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};