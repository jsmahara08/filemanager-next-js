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
  hasChildren: boolean;
}

export const FileSidebar = ({ currentPath, onNavigate, files }: FileSidebarProps) => {
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [allFolders, setAllFolders] = useState<FileItem[]>([]);

  // Fetch all folders recursively
  const fetchAllFolders = async (path: string = '/', visited: Set<string> = new Set()): Promise<FileItem[]> => {
    if (visited.has(path)) return [];
    visited.add(path);

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      const folders = data.files.filter((file: FileItem) => file.type === 'folder');
      
      let allFolders = [...folders];
      
      // Recursively fetch subfolders
      for (const folder of folders) {
        const subFolders = await fetchAllFolders(folder.path, visited);
        allFolders = [...allFolders, ...subFolders];
      }
      
      return allFolders;
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  };

  // Load all folders on component mount
  useEffect(() => {
    const loadAllFolders = async () => {
      const folders = await fetchAllFolders();
      setAllFolders(folders);
    };
    loadAllFolders();
  }, []);

  // Build folder tree from all folders
  useEffect(() => {
    const buildFolderTree = (folders: FileItem[]): FolderNode[] => {
      const folderMap = new Map<string, FolderNode>();
      
      // Create all folder nodes
      folders.forEach(folder => {
        const hasChildren = folders.some(f => 
          f.path.startsWith(folder.path + '/') && 
          f.path.split('/').length === folder.path.split('/').length + 1
        );
        
        folderMap.set(folder.path, {
          id: folder.id,
          name: folder.name,
          path: folder.path,
          children: [],
          isExpanded: expandedFolders.has(folder.path),
          hasChildren
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
      
      // Sort nodes by name
      const sortNodes = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.sort((a, b) => a.name.localeCompare(b.name)).map(node => ({
          ...node,
          children: sortNodes(node.children)
        }));
      };
      
      return sortNodes(rootNodes);
    };

    setFolderTree(buildFolderTree(allFolders));
  }, [allFolders, expandedFolders]);

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
    const Icon = isActive ? FolderOpen : Folder;

    return (
      <div key={node.id}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            onNavigate(node.path);
          }}
          className={cn(
            "w-full justify-start text-left h-8 px-2 mb-0.5",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {node.hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
                className="p-0.5 hover:bg-muted rounded flex items-center justify-center"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!node.hasChildren && <div className="w-4" />}
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate text-sm">{node.name}</span>
          </div>
        </Button>
        
        {/* Render children if expanded */}
        {isExpanded && node.hasChildren && (
          <div>
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const currentFolders = files.filter(file => file.type === 'folder');
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
          <div className="space-y-0.5 mt-2">
            {folderTree.map(node => renderFolderNode(node))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{files.length} items total</p>
          <p>{currentFolders.length} folders</p>
          <p>{totalFiles} files</p>
        </div>
      </div>
    </div>
  );
};