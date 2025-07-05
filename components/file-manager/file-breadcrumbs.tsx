'use client';

import { generateBreadcrumbs } from '@/lib/file-utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

interface FileBreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const FileBreadcrumbs = ({ currentPath, onNavigate }: FileBreadcrumbsProps) => {
  const breadcrumbs = generateBreadcrumbs(currentPath);

  return (
    <div className="flex items-center gap-1 p-3 overflow-x-auto">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(breadcrumb.path)}
            className="flex items-center gap-1 px-2 py-1 h-auto text-sm"
          >
            {index === 0 && <Home className="w-4 h-4" />}
            {breadcrumb.name}
          </Button>
        </div>
      ))}
    </div>
  );
};