'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileItem } from '@/types/file-manager';
import { FileBreadcrumbs } from './file-breadcrumbs';
import { formatFileSize, getFileIcon, getFileColor, isImageFile } from '@/lib/file-utils';
import { Loader2, FolderOpen, File, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (fileUrl: string, fileName: string) => void;
  fileFilter?: 'images' | 'all';
  title?: string;
}

export const FileBrowserModal = ({ 
  isOpen, 
  onClose, 
  onSelectFile, 
  fileFilter = 'all',
  title = 'Select File'
}: FileBrowserModalProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:3001/uploads';

  const fetchFiles = async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      let filteredFiles = data.files;
      
      // Filter files based on type if specified
      if (fileFilter === 'images') {
        filteredFiles = data.files.filter((file: FileItem) => {
          if (file.type === 'folder') return true;
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
          return imageExtensions.includes(file.extension?.toLowerCase() || '');
        });
      }
      
      setFiles(filteredFiles);
      setCurrentPath(path);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles(currentPath);
      setSelectedFileId('');
    }
  }, [isOpen, currentPath]);

  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      setSelectedFileId('');
    } else {
      setSelectedFileId(file.id);
    }
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      setSelectedFileId('');
    } else {
      // Generate proper file URL with domain
      const fileUrl = `${baseUrl}${file.path}`;
      onSelectFile(fileUrl, file.name);
      handleClose();
    }
  };

  const handleConfirmSelection = () => {
    const selectedFile = files.find(f => f.id === selectedFileId);
    if (selectedFile && selectedFile.type === 'file') {
      const fileUrl = `${baseUrl}${selectedFile.path}`;
      onSelectFile(fileUrl, selectedFile.name);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFileId('');
    setCurrentPath('/');
    onClose();
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  const renderFileThumbnail = (file: FileItem) => {
    if (isImageFile(file)) {
      return (
        <div className="relative w-full h-16 bg-muted/30 rounded overflow-hidden">
          <img
            src={`${baseUrl}${file.path}`}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      );
    }

    const IconComponent = (Icons as any)[getFileIcon(file)] || Icons.File;
    return (
      <div className="w-full h-16 bg-muted/30 rounded flex flex-col items-center justify-center gap-1">
        <IconComponent className={cn("w-6 h-6", getFileColor(file))} />
        {file.extension && (
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {file.extension}
          </span>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Breadcrumbs */}
          <div className="border-b">
            <FileBreadcrumbs
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          </div>
          
          {/* File List */}
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-destructive">{error}</p>
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No {fileFilter === 'images' ? 'images' : 'files'} found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  
                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/50",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:bg-muted/50"
                      )}
                      onClick={() => handleFileSelect(file)}
                      onDoubleClick={() => handleFileDoubleClick(file)}
                    >
                      {isSelected && file.type === 'file' && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 z-10">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        {/* Thumbnail */}
                        {renderFileThumbnail(file)}
                        
                        {/* File Info */}
                        <div className="text-center">
                          <p className="font-medium text-xs truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          {/* Selected File Info */}
          {selectedFile && (
            <div className="border-t p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border">
                  {isImageFile(selectedFile) ? (
                    <img
                      src={`${baseUrl}${selectedFile.path}`}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const IconComponent = (Icons as any)[getFileIcon(selectedFile)] || Icons.File;
                        e.currentTarget.outerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 ${getFileColor(selectedFile)}"><use href="#${getFileIcon(selectedFile)}"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {(() => {
                        const IconComponent = (Icons as any)[getFileIcon(selectedFile)] || Icons.File;
                        return <IconComponent className={cn("w-6 h-6", getFileColor(selectedFile))} />;
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.extension?.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {baseUrl}{selectedFile.path}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {fileFilter === 'images' ? 'Select an image file' : 'Select a file'} to continue
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSelection}
                disabled={!selectedFile || selectedFile.type === 'folder'}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Select File
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};