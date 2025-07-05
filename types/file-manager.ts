export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: string;
  path: string;
  extension?: string;
  parentId?: string;
}

export interface FileManagerState {
  currentPath: string;
  files: FileItem[];
  selectedFiles: string[];
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'size' | 'modified';
  sortOrder: 'asc' | 'desc';
  clipboard: {
    files: string[];
    operation: 'copy' | 'cut' | null;
  };
  isLoading: boolean;
  error: string | null;
}

export interface FileOperation {
  type: 'upload' | 'download' | 'delete' | 'rename' | 'move' | 'copy' | 'create-folder';
  fileIds: string[];
  targetPath?: string;
  newName?: string;
}

export interface ContextMenuItem {
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}