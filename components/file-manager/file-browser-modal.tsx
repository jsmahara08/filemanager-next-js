'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileItem } from '@/types/file-manager';
import { FileBreadcrumbs } from './file-breadcrumbs';
import { formatFileSize, getFileIcon, getFileColor, isImageFile } from '@/lib/file-utils';
import { Loader2, FolderOpen, File, Image as ImageIcon, Check, Play, Music, Archive, FileText } from 'lucide-react';
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
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
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
    if (file.type === 'folder') {
      return (
        <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center border">
          <Icons.Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      );
    }

    if (isImageFile(file)) {
      return (
        <div className="relative w-full h-20 bg-muted/30 rounded-lg overflow-hidden border">
          <img
            src={`${baseUrl}${file.path}`}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-muted/30">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      );
    }

    // Enhanced display for different file types
    const getFileTypeDisplay = () => {
      const ext = file.extension?.toLowerCase();
      
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
          icon: <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        };
      }
      
      if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
          icon: <Music className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        };
      }
      
      if (['zip', 'rar', '7z'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
          icon: <Archive className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        };
      }
      
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
          icon: <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
        };
      }
      
      const IconComponent = (Icons as any)[getFileIcon(file)] || Icons.File;
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
        icon: <IconComponent className={cn("w-6 h-6", getFileColor(file))} />
      };
    };

    const fileDisplay = getFileTypeDisplay();

    return (
      <div className={cn("w-full h-20 rounded-lg flex flex-col items-center justify-center gap-1 border", fileDisplay.bg)}>
        {fileDisplay.icon}
        {file.extension && (
          <span className="text-xs font-medium text-muted-foreground uppercase px-1 py-0.5 bg-white/80 dark:bg-black/20 rounded">
            {file.extension}
          </span>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {files.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  
                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "relative p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md transform -translate-y-1"
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
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-background border">
                  {isImageFile(selectedFile) ? (
                    <img
                      src={`${baseUrl}${selectedFile.path}`}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const IconComponent = (Icons as any)[getFileIcon(selectedFile)] || Icons.File;
                        e.currentTarget.outerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted/30"><svg class="w-6 h-6 ${getFileColor(selectedFile)}"><use href="#${getFileIcon(selectedFile)}"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
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
                  <p className="text-xs text-muted-foreground font-mono truncate">
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