'use client';

import { useState, useEffect } from 'react';
import { FileItem } from '@/types/file-manager';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FolderOpen, Home, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  files: FileItem[];
}

interface FolderNode {
  id: string;
  name: string;
  path: string;
  children: FolderNode[];
  isExpanded: boolean;
}

export const FileSidebar = ({ currentPath, onNavigate, files }: FileSidebarProps) => {
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  // Build folder tree from files
  useEffect(() => {
    const buildFolderTree = (files: FileItem[]): FolderNode[] => {
      const folders = files.filter(file => file.type === 'folder');
      const folderMap = new Map<string, FolderNode>();
      
      // Create all folder nodes
      folders.forEach(folder => {
        folderMap.set(folder.path, {
          id: folder.id,
          name: folder.name,
          path: folder.path,
          children: [],
          isExpanded: expandedFolders.has(folder.path)
        });
      });
      
      // Build tree structure
      const rootNodes: FolderNode[] = [];
      
      folders.forEach(folder => {
        const node = folderMap.get(folder.path);
        if (!node) return;
        
        const pathParts = folder.path.split('/').filter(Boolean);
        
        if (pathParts.length === 1) {
          // Root level folder
          rootNodes.push(node);
        } else {
          // Find parent
          const parentPath = '/' + pathParts.slice(0, -1).join('/');
          const parent = folderMap.get(parentPath);
          if (parent) {
            parent.children.push(node);
          }
        }
      });
      
      return rootNodes;
    };

    setFolderTree(buildFolderTree(files));
  }, [files, expandedFolders]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderFolderNode = (node: FolderNode, level: number = 0) => {
    const isActive = currentPath === node.path;
    const isExpanded = expandedFolders.has(node.path);
    const hasChildren = node.children.length > 0;
    const Icon = isActive ? FolderOpen : Folder;

    return (
      <div key={node.id}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            onNavigate(node.path);
            if (hasChildren) {
              toggleFolder(node.path);
            }
          }}
          className={cn(
            "w-full justify-start text-left h-8 px-2",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate text-sm">{node.name}</span>
          </div>
        </Button>
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const folders = files.filter(file => file.type === 'folder');
  const totalFiles = files.filter(file => file.type === 'file').length;

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
            className="w-full justify-start h-8"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="text-sm">Home</span>
          </Button>

          {/* Render folder tree */}
          <div className="space-y-0.5">
            {folderTree.map(node => renderFolderNode(node))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{files.length} items total</p>
          <p>{folders.length} folders</p>
          <p>{totalFiles} files</p>
        </div>
      </div>
    </div>
  );
};