'use client';

import { useState } from 'react';
import { FileItem } from '@/types/file-manager'; // Ensure this is correctly typed
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FolderOpen, Home, ChevronDown, ChevronRight } from 'lucide-react'; // Add Chevron icons

interface FileSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  files: FileItem[];
}

export const FileSidebar = ({ currentPath, onNavigate, files }: FileSidebarProps) => {
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  // Filter folders from the list of files
  const folders = files.filter(file => file.type === 'folder');

  // Helper function to toggle folder expansion
  const toggleFolder = (folderPath: string) => {
    setOpenFolders(prevState =>
      prevState.includes(folderPath)
        ? prevState.filter(path => path !== folderPath) // Remove if already open
        : [...prevState, folderPath] // Add if closed
    );
  };

  // Check if a folder has children (subfolders)
  const hasChildren = (parentPath: string, items: FileItem[]) => {
    return items.some(item => item.type === 'folder' && item.path.startsWith(parentPath) && item.path !== parentPath);
  };

  // Recursive function to render folder hierarchy
  const renderFolderHierarchy = (parentPath: string, items: FileItem[]) => {
    return items
      .filter(item => 
        item.type === 'folder' && item.path.startsWith(parentPath) && item.path !== parentPath
      ) // Ensure no infinite loops and avoid the parent folder itself
      .map(folder => {
        const isActive = currentPath === folder.path;
        const isOpen = openFolders.includes(folder.path);
        const Icon = isActive ? FolderOpen : Folder;

        return (
          <div key={folder.id} className="ml-4">
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                toggleFolder(folder.path); // Toggle folder state
                onNavigate(folder.path); // Trigger navigation
              }}
              className="w-full justify-start"
            >
              <div className="flex items-center">
                {hasChildren(folder.path, folders) && (
                  <div className="mr-2">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
                <Icon className="w-4 h-4 mr-2" />
                {folder.name}
              </div>
            </Button>
            {/* Only render subfolders if the parent is open */}
            {isOpen && renderFolderHierarchy(folder.path, folders)} {/* Recursively render subfolders */}
          </div>
        );
      });
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">File Manager</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <Button
            variant={currentPath === '/' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('/')}
            className="w-full justify-start"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>

          {/* Render root folders */}
          {renderFolderHierarchy('/', folders)}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{files.length} items</p>
          <p>{folders.length} folders</p>
          <p>{files.length - folders.length} files</p>
        </div>
      </div>
    </div>
  );
};
