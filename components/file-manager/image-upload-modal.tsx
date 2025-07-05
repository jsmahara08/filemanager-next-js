'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, FolderOpen, Link } from 'lucide-react';
import { FileBrowserModal } from './file-browser-modal';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => void;
}

export const ImageUploadModal = ({ isOpen, onClose, onUpload }: ImageUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Generate mock file URL (in production, this would be the actual upload URL)
      const mockUrl = `localhost:3000/uploads/${file.name}`;
      setFileUrl(mockUrl);
    }
  };

  const handleFileBrowserSelect = (url: string, fileName: string) => {
    setFileUrl(url);
    setPreviewUrl(url);
    setSelectedFile(null); // Clear local file since we're using existing file
    setShowFileBrowser(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      const fileList = new DataTransfer();
      fileList.items.add(selectedFile);
      onUpload(fileList.files);
      handleClose();
    } else if (fileUrl) {
      // If using existing file URL, just close the modal
      // In a real app, you might want to handle this differently
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasContent = selectedFile || fileUrl;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Upload Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Upload Options */}
            <div className="space-y-3">
              <Label>Select Image Source</Label>
              
              {/* Upload Area */}
              <div
                onClick={handleBrowseClick}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to browse for new images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>

              {/* Browse Existing Files Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFileBrowser(true)}
                className="w-full flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Browse Existing Files
              </Button>
            </div>

            {/* File URL Input */}
            {fileUrl && (
              <div className="space-y-2">
                <Label htmlFor="fileUrl" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  File URL
                </Label>
                <Input
                  id="fileUrl"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="bg-muted/50"
                  placeholder="Enter or paste image URL"
                />
                <p className="text-xs text-muted-foreground">
                  You can edit this URL or copy it for use elsewhere
                </p>
              </div>
            )}

            {/* File Details */}
            {selectedFile && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {selectedFile.type}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!hasContent}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {selectedFile ? 'Upload Image' : 'Use Selected'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Browser Modal */}
      <FileBrowserModal
        isOpen={showFileBrowser}
        onClose={() => setShowFileBrowser(false)}
        onSelectFile={handleFileBrowserSelect}
        fileFilter="images"
        title="Select Image from Files"
      />
    </>
  );
};