'use client';

import { FileItem } from '@/types/file-manager';
import { formatFileSize, getFileIcon, getFileColor } from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
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

  return (
    <div
      className={cn(
        "relative group p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/50",
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
        <div className="p-3 rounded-lg bg-muted/30">
          <IconComponent className={cn("w-8 h-8", getFileColor(file))} />
        </div>
        
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