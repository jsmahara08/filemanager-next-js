import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FileItem } from '@/types/file-manager';

const ROOT_DIR = path.join(process.cwd(), 'public/uploads');

// Helper function to get file info
async function getFileInfo(filePath: string): Promise<FileItem | null> {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
    const stats = await fs.stat(fullPath);
    const fileName = path.basename(fullPath);
    
    return {
      id: filePath,
      name: fileName,
      type: 'file',
      size: stats.size,
      modified: stats.mtime.toISOString(),
      path: filePath,
      extension: path.extname(fileName).slice(1),
    };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }
  
  try {
    const file = await getFileInfo(fileId);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const filePath = path.join(ROOT_DIR, fileId);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    const ext = path.extname(file.name).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileIds } = await request.json();
    
    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json({ error: 'File IDs are required' }, { status: 400 });
    }
    
    // Get file information for all requested files
    const files: FileItem[] = [];
    for (const fileId of fileIds) {
      const file = await getFileInfo(fileId);
      if (file) {
        files.push(file);
      }
    }
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }
    
    if (files.length === 1) {
      // Single file download
      const file = files[0];
      const filePath = path.join(ROOT_DIR, file.path);
      
      try {
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(file.name).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.pdf': 'application/pdf',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.txt': 'text/plain',
          '.json': 'application/json',
          '.zip': 'application/zip',
          '.rar': 'application/x-rar-compressed',
          '.mp4': 'video/mp4',
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
        };
        
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }
    
    // Multiple files - create a simple archive (for demo purposes)
    // In production, you would use a proper zip library like 'archiver'
    const archiveContent = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(ROOT_DIR, file.path);
          const content = await fs.readFile(filePath);
          return {
            name: file.name,
            content: content.toString('base64'),
            size: file.size,
          };
        } catch {
          return null;
        }
      })
    );
    
    const validFiles = archiveContent.filter(Boolean);
    const archiveData = JSON.stringify(validFiles, null, 2);
    
    return new NextResponse(archiveData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="files-archive.json"',
      },
    });
  } catch (error) {
    console.error('Bulk download error:', error);
    return NextResponse.json({ error: 'Bulk download failed' }, { status: 500 });
  }
}