'use client';

import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FolderPlus, 
  RefreshCw, 
  Grid3x3, 
  List, 
  Trash2, 
  Download,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ImageUploadModal } from './image-upload-modal';

interface FileToolbarProps {
  selectedFiles: string[];
  viewMode: 'grid' | 'list';
  onToggleView: () => void;
  onUpload: (files: FileList) => void;
  onCreateFolder: () => void;
  onRefresh: () => void;
  hasClipboard: boolean;
  onPaste: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onDownload: () => void;
}

export const FileToolbar = ({
  selectedFiles,
  viewMode,
  onToggleView,
  onUpload,
  onCreateFolder,
  onRefresh,
  hasClipboard,
  onPaste,
  onDelete,
  onPreview,
  onDownload,
}: FileToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleImageUpload = (files: FileList) => {
    onUpload(files);
  };

  const hasSelection = selectedFiles.length > 0;
  const isSingleSelection = selectedFiles.length === 1;

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageUpload(true)}
          className="flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Upload Image
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateFolder}
          className="flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onPaste}
          disabled={!hasClipboard}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Paste
        </Button>
        
        {hasSelection && (
          <>
            {isSingleSelection && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {hasSelection ? `(${selectedFiles.length})` : ''}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedFiles.length})
            </Button>
          </>
        )}
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleView}
            className="p-2"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleView}
            className="p-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUpload={handleImageUpload}
      />
    </>
  );
};