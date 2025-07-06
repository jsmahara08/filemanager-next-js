'use client';

import { FileItem } from '@/types/file-manager';
import { formatFileSize, getFileIcon, getFileColor, isImageFile } from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Image as ImageIcon } from 'lucide-react';
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
        <div className="w-full h-20 bg-muted/30 rounded flex items-center justify-center">
          <IconComponent className={cn("w-10 h-10", getFileColor(file))} />
        </div>
      );
    }

    if (isImageFile(file)) {
      return (
        <div className="relative w-full h-20 bg-muted/30 rounded overflow-hidden">
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
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      );
    }

    // For non-image files, show icon with file type indicator
    return (
      <div className="w-full h-20 bg-muted/30 rounded flex flex-col items-center justify-center gap-1">
        <IconComponent className={cn("w-8 h-8", getFileColor(file))} />
        {file.extension && (
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {file.extension}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative group p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/50",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:bg-muted/50"
      )}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-background border-2"
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        {renderThumbnail()}
        
        <div className="text-center w-full">
          <p className="font-medium text-sm truncate" title={file.name}>
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