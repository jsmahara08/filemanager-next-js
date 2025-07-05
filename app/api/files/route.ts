import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FileItem } from '@/types/file-manager';

const ROOT_DIR = path.join(process.cwd(), 'public/uploads');

async function readDirectory(directoryPath: string): Promise<FileItem[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files: FileItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    const stats = await fs.stat(fullPath);

    const relativePath = '/' + path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    files.push({
      id: relativePath,
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file',
      size: entry.isDirectory() ? 0 : stats.size,
      modified: stats.mtime.toISOString(),
      path: relativePath,
      extension: !entry.isDirectory() ? path.extname(entry.name).slice(1) : undefined,
    });
  }

  return files;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get('path') || '/';
  const targetPath = path.join(ROOT_DIR, requestedPath);

  try {
    const files = await readDirectory(targetPath);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, fileIds, targetPath, newName } = body;

    const resolvedTargetPath = path.resolve(ROOT_DIR, '.' + (targetPath || '/'));
    if (!resolvedTargetPath.startsWith(ROOT_DIR)) throw new Error('Invalid target path');

    switch (operation) {
      case 'delete':
        for (const filePath of fileIds) {
          const absPath = path.resolve(ROOT_DIR, '.' + filePath);
          if (!absPath.startsWith(ROOT_DIR)) throw new Error('Invalid file path');
          const stat = await fs.stat(absPath);
          if (stat.isDirectory()) {
            await fs.rm(absPath, { recursive: true, force: true });
          } else {
            await fs.unlink(absPath);
          }
        }
        break;

      case 'rename':
        if (fileIds.length === 1 && newName) {
          const oldPath = path.resolve(ROOT_DIR, '.' + fileIds[0]);
          const newPath = path.join(path.dirname(oldPath), newName);
          if (!oldPath.startsWith(ROOT_DIR) || !newPath.startsWith(ROOT_DIR)) {
            throw new Error('Invalid rename path');
          }
          await fs.rename(oldPath, newPath);
        }
        break;

      case 'copy':
        for (const filePath of fileIds) {
          const sourcePath = path.resolve(ROOT_DIR, '.' + filePath);
          if (!sourcePath.startsWith(ROOT_DIR)) throw new Error('Invalid source path');

          const stat = await fs.stat(sourcePath);
          const baseName = path.basename(sourcePath);
          const ext = path.extname(baseName);
          const nameOnly = path.basename(baseName, ext);
          let copyName = `${nameOnly} - Copy${ext}`;
          let destPath = path.join(resolvedTargetPath, copyName);
          let counter = 1;

          // Prevent filename collisions
          while (true) {
            try {
              await fs.access(destPath);
              copyName = `${nameOnly} - Copy (${counter++})${ext}`;
              destPath = path.join(resolvedTargetPath, copyName);
            } catch {
              break; // File does not exist
            }
          }

          if (stat.isDirectory()) {
            return NextResponse.json({ error: 'Folder copy not implemented' }, { status: 400 });
          } else {
            await fs.copyFile(sourcePath, destPath);
          }
        }
        break;

      case 'move':
        for (const filePath of fileIds) {
          const oldPath = path.resolve(ROOT_DIR, '.' + filePath);
          const fileName = path.basename(oldPath);
          const newPath = path.join(resolvedTargetPath, fileName);

          if (!oldPath.startsWith(ROOT_DIR) || !newPath.startsWith(ROOT_DIR)) {
            throw new Error('Invalid move path');
          }

          await fs.rename(oldPath, newPath);
        }
        break;

      case 'create-folder':
        if (newName) {
          const folderPath = path.join(resolvedTargetPath, newName);
          if (!folderPath.startsWith(ROOT_DIR)) throw new Error('Invalid folder path');
          await fs.mkdir(folderPath, { recursive: true });
        }
        break;

      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing file operation:', error);
    return NextResponse.json({ error: 'Operation failed', details: error.message }, { status: 500 });
  }
}
