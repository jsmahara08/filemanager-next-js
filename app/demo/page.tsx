'use client';

import { useState } from 'react';
import { FileUrlInput } from '@/components/file-manager/file-url-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DemoPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', {
      title,
      description,
      imageUrl,
      documentUrl,
    });
    alert('Form submitted! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">File Manager Demo</h1>
          <p className="text-muted-foreground mt-2">
            Demonstration of file browser popup with URL input integration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter content description"
                  rows={3}
                />
              </div>

              <FileUrlInput
                label="Featured Image"
                placeholder="Select an image file"
                value={imageUrl}
                onChange={setImageUrl}
                fileFilter="images"
              />

              <FileUrlInput
                label="Attachment"
                placeholder="Select any file"
                value={documentUrl}
                onChange={setDocumentUrl}
                fileFilter="all"
              />

              {/* Preview */}
              {(imageUrl || documentUrl) && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium">Selected Files:</h3>
                  {imageUrl && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Image:</p>
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-sm font-mono break-all">{imageUrl}</p>
                      </div>
                    </div>
                  )}
                  {documentUrl && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Document:</p>
                      <p className="text-sm font-mono break-all">{documentUrl}</p>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full">
                Submit Form
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}