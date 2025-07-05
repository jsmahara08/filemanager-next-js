import { NextRequest, NextResponse } from 'next/server';
import { FileItem } from '@/types/file-manager';

// Mock file system data
const mockFiles: FileItem[] = [
  {
    id: '4',
    name: 'README.md',
    type: 'file',
    size: 1024,
    modified: new Date(Date.now() - 3600000).toISOString(),
    path: '/README.md',
    extension: 'md',
  },
  // Add more mock files as needed
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }
  
  try {
    const file = mockFiles.find(f => f.id === fileId);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // In production, read the actual file from storage
    const mockContent = `# ${file.name}\n\nThis is a mock file content for demonstration purposes.\n\nFile details:\n- Name: ${file.name}\n- Size: ${file.size} bytes\n- Modified: ${file.modified}`;
    
    return new NextResponse(mockContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${file.name}"`,
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
    
    // For multiple files, create a zip file
    // In production, use a library like archiver to create actual zip files
    const files = mockFiles.filter(file => fileIds.includes(file.id));
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }
    
    if (files.length === 1) {
      // Single file download
      const file = files[0];
      const mockContent = `# ${file.name}\n\nThis is a mock file content for demonstration purposes.`;
      
      return new NextResponse(mockContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
      });
    }
    
    // Multiple files - create zip
    const zipContent = files.map(file => `=== ${file.name} ===\nMock content for ${file.name}\n\n`).join('');
    
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="files.zip"',
      },
    });
  } catch (error) {
    console.error('Bulk download error:', error);
    return NextResponse.json({ error: 'Bulk download failed' }, { status: 500 });
  }
}