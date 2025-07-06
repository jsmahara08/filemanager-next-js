'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileItem } from '@/types/file-manager';
import { formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/file-utils';
import { Download, X, ZoomIn, ZoomOut, RotateCw, Eye, FileText, Play, Music } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal = ({ isOpen, onClose, file, onDownload }: FilePreviewModalProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [textContent, setTextContent] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  
  if (!file) return null;

  const baseUrl = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:3001/uploads';
  const fileUrl = `${baseUrl}${file.path}`;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const loadTextContent = async () => {
    if (!file) return;
    
    setIsLoadingText(true);
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        const text = await response.text();
        setTextContent(text);
      } else {
        setTextContent('Failed to load file content');
      }
    } catch (error) {
      setTextContent('Error loading file content');
    } finally {
      setIsLoadingText(false);
    }
  };

  const renderPreview = () => {
    const ext = file.extension?.toLowerCase();

    // Image preview
    if (isImageFile(file)) {
      return (
        <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden">
          <img
            src={fileUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground" />
              <p>Failed to load image</p>
            </div>
          </div>
        </div>
      );
    }

    // PDF preview
    if (ext === 'pdf') {
      return (
        <div className="flex-1 bg-background rounded-lg border overflow-hidden">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full"
            title={file.name}
            onError={() => {
              console.error('Failed to load PDF');
            }}
          />
        </div>
      );
    }

    // Text file preview
    if (['txt', 'md', 'json', 'xml', 'csv', 'js', 'ts', 'html', 'css'].includes(ext || '')) {
      return (
        <div className="flex-1 bg-background rounded-lg border overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTextContent}
                disabled={isLoadingText}
              >
                {isLoadingText ? 'Loading...' : 'Load Content'}
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {textContent ? (
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {textContent}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 mx-auto" />
                    <p>Click "Load Content" to view file</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Video preview
    if (isVideoFile(file)) {
      return (
        <div className="flex-1 flex items-center justify-center bg-black rounded-lg">
          <video
            controls
            className="max-w-full max-h-full rounded"
            style={{ transform: `scale(${zoom / 100})` }}
            preload="metadata"
          >
            <source src={fileUrl} />
            <p className="text-white">Your browser does not support the video tag.</p>
          </video>
        </div>
      );
    }

    // Audio preview
    if (isAudioFile(file)) {
      return (
        <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Music className="w-16 h-16 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-xl mb-2">{file.name}</h3>
              <p className="text-muted-foreground mb-4">
                {file.extension?.toUpperCase()} Audio • {formatFileSize(file.size)}
              </p>
            </div>
            <audio controls className="w-full">
              <source src={fileUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      );
    }

    // Default preview for unsupported files
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Eye className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-xl mb-2">{file.name}</h3>
            <p className="text-muted-foreground mb-2">Preview not available</p>
            <p className="text-sm text-muted-foreground">
              {file.extension?.toUpperCase()} • {formatFileSize(file.size)}
            </p>
          </div>
          <Button onClick={() => onDownload(file)} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download to View
          </Button>
        </div>
      </div>
    );
  };

  const showImageControls = isImageFile(file);
  const showVideoControls = isVideoFile(file);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 truncate">
              <Eye className="w-5 h-5" />
              <span className="truncate">{file.name}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {(showImageControls || showVideoControls) && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 25}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 300}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </>
              )}
              {showImageControls && (
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="w-4 h-4" />
                </Button>
              )}
              {(showImageControls || showVideoControls) && (
                <Button variant="outline" size="sm" onClick={resetView}>
                  Reset
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 p-4">
          {renderPreview()}
        </div>
        
        <div className="flex-shrink-0 border-t p-4 bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">
                {file.extension?.toUpperCase()} • {formatFileSize(file.size)}
              </span>
            </div>
            <div className="text-muted-foreground font-mono text-xs truncate max-w-md">
              {fileUrl}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};