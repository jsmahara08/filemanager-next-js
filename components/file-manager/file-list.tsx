'use client';

import React from 'react';
import { FileItem } from '@/types/file-manager';
import {
  formatFileSize,
  formatDate,
  getFileIcon,
  getFileColor,
  isImageFile,
} from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import * as Icons from 'lucide-react';

interface FileListProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFileDoubleClick: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, fileId?: string) => void;
  sortBy: 'name' | 'size' | 'modified';
  sortOrder: 'asc' | 'desc';
  onSort: (sortBy: 'name' | 'size' | 'modified') => void;
}

export const FileList = ({
  files,
  selectedFiles,
  onFileSelect,
  onFileDoubleClick,
  onContextMenu,
  sortBy,
  sortOrder,
  onSort,
}: FileListProps) => {
  const SortIcon = sortOrder === 'asc' ? ChevronUp : ChevronDown;
  const baseUrl = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:3001/uploads';

  // Map file icon names to lucide-react icon components
  const iconMap: Record<string, React.ElementType> = {
    Folder: Icons.Folder,
    Image: Icons.Image,
    FileText: Icons.FileText,
    FileSpreadsheet: Icons.FileSpreadsheet,
    Archive: Icons.Archive,
    Video: Icons.Video,
    Music: Icons.Music,
    Code: Icons.Code,
    File: Icons.File,
  };

  const getSortButton = (
    field: 'name' | 'size' | 'modified',
    label: string
  ) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="h-8 px-2 font-medium text-left justify-start"
    >
      {label}
      {sortBy === field && <SortIcon className="ml-1 w-4 h-4" />}
    </Button>
  );

  const renderThumbnail = (file: FileItem) => {
    if (file.type === 'folder') {
      const IconComponent = iconMap.Folder;
      return <IconComponent className={cn('w-8 h-8 shrink-0', getFileColor(file))} />;
    }

    if (isImageFile(file)) {
      return (
        <div className="relative w-12 h-8 bg-muted/30 rounded overflow-hidden">
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
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      );
    }

    const iconName = getFileIcon(file);
    const IconComponent = iconMap[iconName] || Icons.File;
    return <IconComponent className={cn('w-8 h-8 shrink-0', getFileColor(file))} />;
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No files or folders to display</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="grid grid-cols-[auto_auto_1fr_120px_180px] gap-4 py-2 px-4 border-b bg-muted/30 text-sm font-medium">
        <div className="w-6" />
        <div className="w-12">Preview</div>
        {getSortButton('name', 'Name')}
        {getSortButton('size', 'Size')}
        {getSortButton('modified', 'Modified')}
      </div>

      {/* File Rows */}
      <div className="divide-y">
        {files.map((file) => {
          const isSelected = selectedFiles.includes(file.id);

          return (
            <div
              key={file.id}
              className={cn(
                'grid grid-cols-[auto_auto_1fr_120px_180px] gap-4 py-3 px-4 hover:bg-muted/50 cursor-pointer transition-colors',
                isSelected && 'bg-primary/10'
              )}
              onClick={() => onFileSelect(file.id)}
              onDoubleClick={() => onFileDoubleClick(file)}
              onContextMenu={(e) => onContextMenu(e, file.id)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onFileSelect(file.id)}
                className="mt-1"
              />

              <div className="flex items-center justify-center">
                {renderThumbnail(file)}
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="truncate font-medium"
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                {file.type === 'folder' ? '--' : formatFileSize(file.size)}
              </div>

              <div className="text-sm text-muted-foreground">
                {formatDate(file.modified)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};