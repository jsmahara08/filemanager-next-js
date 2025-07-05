'use client';

import { FileItem } from '@/types/file-manager';
import { FileCard } from './file-card';
import { cn } from '@/lib/utils';

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFileDoubleClick: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, fileId?: string) => void;
}

export const FileGrid = ({
  files,
  selectedFiles,
  onFileSelect,
  onFileDoubleClick,
  onContextMenu,
}: FileGridProps) => {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No files or folders to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onSelect={() => onFileSelect(file.id)}
          onDoubleClick={() => onFileDoubleClick(file)}
          onContextMenu={(e) => onContextMenu(e, file.id)}
        />
      ))}
    </div>
  );
};