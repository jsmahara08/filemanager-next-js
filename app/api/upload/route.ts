import { NextRequest, NextResponse } from 'next/server';
import { FileItem } from '@/types/file-manager';
import { promises as fs } from 'fs';
import path from 'path';

const ROOT_DIR = path.join(process.cwd(), 'public/uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const targetPath = formData.get('path')?.toString() || '/';

    const absoluteTargetPath = path.join(ROOT_DIR, targetPath);
    await fs.mkdir(absoluteTargetPath, { recursive: true }); // Ensure folder exists

    const uploadedFiles: FileItem[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(absoluteTargetPath, file.name);
      await fs.writeFile(filePath, buffer);

      const relativePath = '/' + path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      const fileItem: FileItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file',
        size: file.size,
        modified: new Date().toISOString(),
        path: relativePath,
        extension: file.name.split('.').pop()?.toLowerCase(),
      };

      uploadedFiles.push(fileItem);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${files.length} file(s)`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
