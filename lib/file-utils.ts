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
    case 'svg':
    case 'bmp':
    case 'tiff':
    case 'ico':
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
    case 'wmv':
    case 'flv':
    case 'webm':
      return 'Video';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
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
    case 'xml':
    case 'php':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
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
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
  return imageExtensions.includes(file.extension?.toLowerCase() || '');
};

export const isVideoFile = (file: FileItem): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  return videoExtensions.includes(file.extension?.toLowerCase() || '');
};

export const isAudioFile = (file: FileItem): boolean => {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
  return audioExtensions.includes(file.extension?.toLowerCase() || '');
};

export const canPreview = (file: FileItem): boolean => {
  const previewExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt'];
  return previewExtensions.includes(file.extension?.toLowerCase() || '');
};

export const getFileColor = (file: FileItem): string => {
  if (file.type === 'folder') return 'text-blue-600 dark:text-blue-400';
  
  const ext = file.extension?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
    case 'tiff':
    case 'ico':
      return 'text-green-600 dark:text-green-400';
    case 'pdf':
      return 'text-red-600 dark:text-red-400';
    case 'doc':
    case 'docx':
      return 'text-blue-600 dark:text-blue-400';
    case 'xls':
    case 'xlsx':
      return 'text-green-600 dark:text-green-400';
    case 'zip':
    case 'rar':
    case '7z':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
      return 'text-purple-600 dark:text-purple-400';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
      return 'text-pink-600 dark:text-pink-400';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
    case 'xml':
    case 'php':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const getMimeType = (file: FileItem): string => {
  const ext = file.extension?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'ico': 'image/x-icon',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    
    // Text
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'xml': 'text/xml',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
};