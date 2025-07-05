'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Link, X } from 'lucide-react';
import { FileBrowserModal } from './file-browser-modal';

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

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleFileSelect = (url: string, fileName: string) => {
    handleInputChange(url);
    setShowFileBrowser(false);
  };

  const clearInput = () => {
    handleInputChange('');
  };

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <Label className="flex items-center gap-2">
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
            className="flex items-center gap-2 shrink-0"
          >
            <FolderOpen className="w-4 h-4" />
            Browse
          </Button>
        </div>
        
        {inputValue && (
          <p className="text-xs text-muted-foreground">
            Selected: {inputValue.split('/').pop()}
          </p>
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