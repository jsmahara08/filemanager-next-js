'use client';

import { FileItem } from '@/types/file-manager';
import { formatFileSize, getFileIcon, getFileColor, isImageFile } from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Image as ImageIcon, Play, Music, Archive, FileText } from 'lucide-react';
import * as Icons from 'lucide-react';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const FileCard = ({
  file,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
}: FileCardProps) => {
  const IconComponent = (Icons as any)[getFileIcon(file)] || Icons.File;
  const baseUrl = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:3001/uploads';

  const renderThumbnail = () => {
    if (file.type === 'folder') {
      return (
        <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center border">
          <IconComponent className={cn("w-12 h-12", getFileColor(file))} />
        </div>
      );
    }

    if (isImageFile(file)) {
      return (
        <div className="relative w-full h-24 bg-muted/30 rounded-lg overflow-hidden border group">
          <img
            src={`${baseUrl}${file.path}`}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-muted/50">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          {/* Image overlay with file info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-medium truncate">
                {file.name}
              </p>
              <p className="text-white/80 text-xs">
                {formatFileSize(file.size)}
              </p>
            </div>
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
          icon: <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
          label: 'Video'
        };
      }
      
      if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
          icon: <Music className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
          label: 'Audio'
        };
      }
      
      if (['zip', 'rar', '7z'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
          icon: <Archive className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
          label: 'Archive'
        };
      }
      
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
          icon: <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />,
          label: 'Document'
        };
      }
      
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
        icon: <IconComponent className={cn("w-8 h-8", getFileColor(file))} />,
        label: 'File'
      };
    };

    const fileDisplay = getFileTypeDisplay();

    return (
      <div className={cn("w-full h-24 rounded-lg flex flex-col items-center justify-center gap-1 border", fileDisplay.bg)}>
        {fileDisplay.icon}
        {file.extension && (
          <span className="text-xs font-bold text-muted-foreground uppercase px-2 py-0.5 bg-white/80 dark:bg-black/20 rounded">
            {file.extension}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative group p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
        isSelected
          ? "border-primary bg-primary/10 shadow-md transform -translate-y-1"
          : "border-border bg-card hover:bg-muted/50"
      )}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-background/90 border-2 shadow-sm"
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        {renderThumbnail()}
        
        <div className="text-center w-full">
          <p className="font-medium text-sm truncate leading-tight" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
          </p>
        </div>
      </div>
    </div>
  );
};