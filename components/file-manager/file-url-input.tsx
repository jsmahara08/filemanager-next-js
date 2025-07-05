'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Link, X, Image as ImageIcon, File } from 'lucide-react';
import { FileBrowserModal } from './file-browser-modal';
import { cn } from '@/lib/utils';

interface FileUrlInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (url: string) => void;
  fileFilter?: 'images' | 'all';
  className?: string;
}

export const FileUrlInput = ({
  label = 'File URL',
  placeholder = 'Enter file URL or browse files',
  value = '',
  onChange,
  fileFilter = 'all',
  className = '',
}: FileUrlInputProps) => {
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    setInputValue(value);
    if (value) {
      const fileName = value.split('/').pop() || '';
      setSelectedFileName(fileName);
    } else {
      setSelectedFileName('');
    }
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
    
    if (newValue) {
      const fileName = newValue.split('/').pop() || '';
      setSelectedFileName(fileName);
    } else {
      setSelectedFileName('');
    }
  };

  const handleFileSelect = (url: string, fileName: string) => {
    handleInputChange(url);
    setSelectedFileName(fileName);
    setShowFileBrowser(false);
  };

  const clearInput = () => {
    handleInputChange('');
    setSelectedFileName('');
  };

  const isImageUrl = (url: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = url.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Link className="w-4 h-4" />
          {label}
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="pr-8"
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearInput}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFileBrowser(true)}
            className="flex items-center gap-2 shrink-0 px-4"
          >
            <FolderOpen className="w-4 h-4" />
            Browse
          </Button>
        </div>
        
        {/* File Preview */}
        {inputValue && (
          <div className="p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded border bg-background flex items-center justify-center overflow-hidden shrink-0">
                {isImageUrl(inputValue) ? (
                  <img
                    src={inputValue}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <File className="w-6 h-6 text-muted-foreground" />
                )}
                <div className="hidden w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={selectedFileName}>
                  {selectedFileName || 'Selected file'}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate" title={inputValue}>
                  {inputValue}
                </p>
              </div>
              
              {/* File Type Badge */}
              <div className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                fileFilter === 'images' || isImageUrl(inputValue)
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {fileFilter === 'images' || isImageUrl(inputValue) ? 'Image' : 'File'}
              </div>
            </div>
          </div>
        )}
      </div>

      <FileBrowserModal
        isOpen={showFileBrowser}
        onClose={() => setShowFileBrowser(false)}
        onSelectFile={handleFileSelect}
        fileFilter={fileFilter}
        title={`Select ${fileFilter === 'images' ? 'Image' : 'File'}`}
      />
    </>
  );
};