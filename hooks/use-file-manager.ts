'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileItem, FileManagerState, FileOperation } from '@/types/file-manager';
import { sortFiles } from '@/lib/file-utils';

export const useFileManager = (initialPath: string = '/') => {
  const [state, setState] = useState<FileManagerState>({
    currentPath: initialPath,
    files: [],
    selectedFiles: [],
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    clipboard: {
      files: [],
      operation: null,
    },
    isLoading: false,
    error: null,
  });

  const fetchFiles = useCallback(async (path: string = state.currentPath) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      const sortedFiles = sortFiles(data.files, state.sortBy, state.sortOrder);
      
      setState(prev => ({
        ...prev,
        files: sortedFiles,
        currentPath: path,
        isLoading: false,
        selectedFiles: [], // Clear selection when navigating
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, [state.sortBy, state.sortOrder]);

  const navigateToPath = useCallback((path: string) => {
    fetchFiles(path);
  }, [fetchFiles]);

  const toggleFileSelection = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.includes(fileId)
        ? prev.selectedFiles.filter(id => id !== fileId)
        : [...prev.selectedFiles, fileId],
    }));
  }, []);

  const selectAllFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFiles: prev.files.map(file => file.id),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedFiles: [] }));
  }, []);

  const toggleViewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid',
    }));
  }, []);

  const setSortBy = useCallback((sortBy: 'name' | 'size' | 'modified') => {
    setState(prev => {
      const newSortOrder = prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      const sortedFiles = sortFiles(prev.files, sortBy, newSortOrder);
      
      return {
        ...prev,
        sortBy,
        sortOrder: newSortOrder,
        files: sortedFiles,
      };
    });
  }, []);

  const performFileOperation = useCallback(async (operation: FileOperation) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: operation.type,
          fileIds: operation.fileIds,
          targetPath: operation.targetPath || state.currentPath,
          newName: operation.newName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Operation failed');
      }
      
      // Refresh files after operation
      await fetchFiles(state.currentPath);
      
      setState(prev => ({ ...prev, selectedFiles: [], isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Operation failed',
        isLoading: false,
      }));
    }
  }, [state.currentPath, fetchFiles]);

  const copyFiles = useCallback((fileIds: string[]) => {
    if (fileIds.length > 0) {
      setState(prev => ({
        ...prev,
        clipboard: {
          files: fileIds,
          operation: 'copy',
        },
      }));
    }
  }, []);

  const cutFiles = useCallback((fileIds: string[]) => {
    if (fileIds.length > 0) {
      setState(prev => ({
        ...prev,
        clipboard: {
          files: fileIds,
          operation: 'cut',
        },
      }));
    }
  }, []);

  const pasteFiles = useCallback(async () => {
    if (state.clipboard.operation && state.clipboard.files.length > 0) {
      await performFileOperation({
        type: state.clipboard.operation === 'copy' ? 'copy' : 'move',
        fileIds: state.clipboard.files,
        targetPath: state.currentPath,
      });
      
      if (state.clipboard.operation === 'cut') {
        setState(prev => ({
          ...prev,
          clipboard: { files: [], operation: null },
        }));
      }
    }
  }, [state.clipboard, state.currentPath, performFileOperation]);

  const uploadFiles = useCallback(async (files: FileList) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('path', state.currentPath);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      await fetchFiles(state.currentPath);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        isLoading: false,
      }));
    }
  }, [state.currentPath, fetchFiles]);

  // Initialize by fetching files
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    state,
    actions: {
      navigateToPath,
      toggleFileSelection,
      selectAllFiles,
      clearSelection,
      toggleViewMode,
      setSortBy,
      performFileOperation,
      copyFiles,
      cutFiles,
      pasteFiles,
      uploadFiles,
      refreshFiles: () => fetchFiles(state.currentPath),
    },
  };
};