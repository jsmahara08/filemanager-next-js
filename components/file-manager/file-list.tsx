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
import { ChevronUp, ChevronDown, Image as ImageIcon, Play, Music, Archive, FileText } from 'lucide-react';
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
      return (
        <div className="w-16 h-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded border flex items-center justify-center">
          <IconComponent className={cn('w-6 h-6', getFileColor(file))} />
        </div>
      );
    }

    if (isImageFile(file)) {
      return (
        <div className="relative w-16 h-10 bg-muted/30 rounded overflow-hidden border">
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

    // Enhanced icons for different file types
    const getFileTypeIcon = () => {
      const ext = file.extension?.toLowerCase();
      
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
          icon: <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        };
      }
      
      if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
          icon: <Music className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        };
      }
      
      if (['zip', 'rar', '7z'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
          icon: <Archive className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        };
      }
      
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
          icon: <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
        };
      }
      
      const iconName = getFileIcon(file);
      const IconComponent = iconMap[iconName] || Icons.File;
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
        icon: <IconComponent className={cn('w-5 h-5', getFileColor(file))} />
      };
    };

    const fileDisplay = getFileTypeIcon();

    return (
      <div className={cn("w-16 h-10 rounded border flex items-center justify-center", fileDisplay.bg)}>
        {fileDisplay.icon}
      </div>
    );
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
      <div className="grid grid-cols-[auto_auto_1fr_120px_180px] gap-4 py-3 px-4 border-b bg-muted/30 text-sm font-medium">
        <div className="w-6" />
        <div className="w-16 text-center">Preview</div>
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
                className="mt-2"
              />

              <div className="flex items-center justify-center">
                {renderThumbnail(file)}
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <span
                    className="truncate font-medium block"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  {file.extension && (
                    <span className="text-xs text-muted-foreground uppercase">
                      {file.extension} file
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground flex items-center">
                {file.type === 'folder' ? '--' : formatFileSize(file.size)}
              </div>

              <div className="text-sm text-muted-foreground flex items-center">
                {formatDate(file.modified)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};