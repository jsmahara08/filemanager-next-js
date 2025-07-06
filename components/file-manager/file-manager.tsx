'use client';

import { useFileManager } from '@/hooks/use-file-manager';
import { FileToolbar } from './file-toolbar';
import { FileGrid } from './file-grid';
import { FileList } from './file-list';
import { FileSidebar } from './file-sidebar';
import { FileModals } from './file-modals';
import { FileContextMenu } from './file-context-menu';
import { FileBreadcrumbs } from './file-breadcrumbs';
import { FilePreviewModal } from './file-preview-modal';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FileItem } from '@/types/file-manager';

export const FileManager = () => {
  const { state, actions } = useFileManager();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId?: string;
  } | null>(null);

  const [modals, setModals] = useState({
    rename: false,
    createFolder: false,
    delete: false,
    move: false,
    preview: false,
    renameFileId: '',
    deleteFileIds: [] as string[],
    previewFile: null as FileItem | null,
  });

  useKeyboardShortcuts({
    onCopy: () => actions.copyFiles(state.selectedFiles),
    onCut: () => actions.cutFiles(state.selectedFiles),
    onPaste: () => actions.pasteFiles(),
    onDelete: () => {
      if (state.selectedFiles.length > 0) {
        setModals(prev => ({ 
          ...prev, 
          delete: true, 
          deleteFileIds: state.selectedFiles 
        }));
      }
    },
    onSelectAll: () => actions.selectAllFiles(),
    onEscape: () => {
      actions.clearSelection();
      setContextMenu(null);
    },
  });

  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      fileId,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      actions.uploadFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCreateFolder = () => {
    setModals(prev => ({ ...prev, createFolder: true }));
  };

  const handleRename = (fileId: string) => {
    setModals(prev => ({ ...prev, rename: true, renameFileId: fileId }));
  };

  const handleDelete = () => {
    if (state.selectedFiles.length > 0) {
      setModals(prev => ({ 
        ...prev, 
        delete: true, 
        deleteFileIds: state.selectedFiles 
      }));
    }
  };

  const handlePreview = (fileId?: string) => {
    const targetFileId = fileId || state.selectedFiles[0];
    const file = state.files.find(f => f.id === targetFileId);
    if (file && file.type === 'file') {
      setModals(prev => ({ ...prev, preview: true, previewFile: file }));
    }
  };

  const handleDownload = async (fileId?: string) => {
    const targetFileIds = fileId ? [fileId] : state.selectedFiles;
    const filesToDownload = state.files.filter(f => targetFileIds.includes(f.id) && f.type === 'file');
    
    if (filesToDownload.length === 0) return;

    try {
      if (filesToDownload.length === 1) {
        // Single file download
        const file = filesToDownload[0];
        const response = await fetch(`/api/download?fileId=${encodeURIComponent(file.id)}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          console.error('Download failed:', response.statusText);
        }
      } else {
        // Multiple files download
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileIds: targetFileIds }),
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `files-${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          console.error('Bulk download failed:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const confirmCreateFolder = (name: string) => {
    actions.performFileOperation({
      type: 'create-folder',
      fileIds: [],
      newName: name,
    });
    setModals(prev => ({ ...prev, createFolder: false }));
  };

  const confirmRename = (newName: string) => {
    if (modals.renameFileId) {
      actions.performFileOperation({
        type: 'rename',
        fileIds: [modals.renameFileId],
        newName,
      });
    }
    setModals(prev => ({ ...prev, rename: false, renameFileId: '' }));
  };

  const confirmDelete = () => {
    actions.performFileOperation({
      type: 'delete',
      fileIds: modals.deleteFileIds,
    });
    setModals(prev => ({ ...prev, delete: false, deleteFileIds: [] }));
  };

  return (
    <div 
      className="h-screen flex flex-col bg-background"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      <div className="flex-1 flex overflow-hidden">
        <FileSidebar
          currentPath={state.currentPath}
          onNavigate={actions.navigateToPath}
          files={state.files}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-card">
            <FileBreadcrumbs
              currentPath={state.currentPath}
              onNavigate={actions.navigateToPath}
            />
            
            <FileToolbar
              selectedFiles={state.selectedFiles}
              viewMode={state.viewMode}
              onToggleView={actions.toggleViewMode}
              onUpload={actions.uploadFiles}
              onCreateFolder={handleCreateFolder}
              onRefresh={() => actions.refreshFiles()}
              hasClipboard={state.clipboard.files.length > 0}
              onPaste={actions.pasteFiles}
              onDelete={handleDelete}
              onPreview={() => handlePreview()}
              onDownload={() => handleDownload()}
            />
          </div>
          
          <div className="flex-1 overflow-auto">
            {state.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : state.error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">{state.error}</p>
              </div>
            ) : state.viewMode === 'grid' ? (
              <FileGrid
                files={state.files}
                selectedFiles={state.selectedFiles}
                onFileSelect={actions.toggleFileSelection}
                onFileDoubleClick={(file) => {
                  if (file.type === 'folder') {
                    actions.navigateToPath(file.path);
                  } else {
                    handlePreview(file.id);
                  }
                }}
                onContextMenu={handleContextMenu}
              />
            ) : (
              <FileList
                files={state.files}
                selectedFiles={state.selectedFiles}
                onFileSelect={actions.toggleFileSelection}
                onFileDoubleClick={(file) => {
                  if (file.type === 'folder') {
                    actions.navigateToPath(file.path);
                  } else {
                    handlePreview(file.id);
                  }
                }}
                onContextMenu={handleContextMenu}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={actions.setSortBy}
              />
            )}
          </div>
        </div>
      </div>
      
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          fileId={contextMenu.fileId}
          selectedFiles={state.selectedFiles}
          onClose={() => setContextMenu(null)}
          onCopy={() => {
            actions.copyFiles(state.selectedFiles);
            setContextMenu(null);
          }}
          onCut={() => {
            actions.cutFiles(state.selectedFiles);
            setContextMenu(null);
          }}
          onPaste={() => {
            actions.pasteFiles();
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDelete();
            setContextMenu(null);
          }}
          onRename={(fileId) => {
            handleRename(fileId);
            setContextMenu(null);
          }}
          onCreateFolder={() => {
            handleCreateFolder();
            setContextMenu(null);
          }}
          onPreview={(fileId) => {
            handlePreview(fileId);
            setContextMenu(null);
          }}
          onDownload={(fileId) => {
            handleDownload(fileId);
            setContextMenu(null);
          }}
          hasClipboard={state.clipboard.files.length > 0}
        />
      )}
      
      <FileModals
        modals={modals}
        onCreateFolder={confirmCreateFolder}
        onRename={confirmRename}
        onDelete={confirmDelete}
        onClose={(modalType) => {
          setModals(prev => ({ 
            ...prev, 
            [modalType]: false,
            ...(modalType === 'rename' && { renameFileId: '' }),
            ...(modalType === 'delete' && { deleteFileIds: [] }),
            ...(modalType === 'preview' && { previewFile: null })
          }));
        }}
        selectedFiles={modals.deleteFileIds}
        renameFile={state.files.find(f => f.id === modals.renameFileId)}
      />

      <FilePreviewModal
        isOpen={modals.preview}
        onClose={() => setModals(prev => ({ ...prev, preview: false, previewFile: null }))}
        file={modals.previewFile}
        onDownload={(file) => handleDownload(file.id)}
      />
    </div>
  );
};

export default FileManager;