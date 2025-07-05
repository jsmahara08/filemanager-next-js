import { FileItem } from '@/types/file-manager';

export const getFileIcon = (file: FileItem): string => {
  if (file.type === 'folder') return 'Folder';
  
  const ext = file.extension?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'Image';
    case 'pdf':
      return 'FileText';
    case 'doc':
    case 'docx':
      return 'FileText';
    case 'xls':
    case 'xlsx':
      return 'FileSpreadsheet';
    case 'zip':
    case 'rar':
    case '7z':
      return 'Archive';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'Video';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'Music';
    case 'txt':
      return 'FileText';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
      return 'Code';
    default:
      return 'File';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const sortFiles = (
  files: FileItem[], 
  sortBy: 'name' | 'size' | 'modified', 
  sortOrder: 'asc' | 'desc'
): FileItem[] => {
  return [...files].sort((a, b) => {
    // Always put folders first
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'modified':
        comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const generateBreadcrumbs = (currentPath: string): { name: string; path: string }[] => {
  const segments = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '/' }];
  
  let path = '';
  for (const segment of segments) {
    path += '/' + segment;
    breadcrumbs.push({ name: segment, path });
  }
  
  return breadcrumbs;
};

export const isImageFile = (file: FileItem): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(file.extension?.toLowerCase() || '');
};

export const canPreview = (file: FileItem): boolean => {
  const previewExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt'];
  return previewExtensions.includes(file.extension?.toLowerCase() || '');
};

export const getFileColor = (file: FileItem): string => {
  if (file.type === 'folder') return 'text-blue-600';
  
  const ext = file.extension?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'text-green-600';
    case 'pdf':
      return 'text-red-600';
    case 'doc':
    case 'docx':
      return 'text-blue-600';
    case 'xls':
    case 'xlsx':
      return 'text-green-600';
    case 'zip':
    case 'rar':
    case '7z':
      return 'text-yellow-600';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'text-purple-600';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'text-pink-600';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};