'use client';

import { useState } from 'react';
import { FileUrlInput } from '@/components/file-manager/file-url-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DemoPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      imageUrl,
      documentUrl,
      logoUrl,
      attachmentUrl,
    };
    console.log('Form submitted:', formData);
    alert('Form submitted! Check console for details.');
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setDocumentUrl('');
    setLogoUrl('');
    setAttachmentUrl('');
  };

  const hasSelectedFiles = imageUrl || documentUrl || logoUrl || attachmentUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Badge variant="secondary">Demo</Badge>
            <span className="text-sm text-muted-foreground">File Manager Integration</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            File Manager Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience seamless file browsing with thumbnail previews, expandable folder navigation, 
            and automatic URL generation for your website domain.
          </p>
        </div>

        {/* Main Form */}
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Create Content with File Attachments</CardTitle>
            <p className="text-muted-foreground">
              Use the file browser to select files from your uploads directory. 
              All selected files will show proper URLs with your domain.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your content"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* File Attachments */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">File Attachments</h3>
                  <Badge variant="outline">Browse & Select</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FileUrlInput
                    label="Featured Image"
                    placeholder="Select a featured image"
                    value={imageUrl}
                    onChange={setImageUrl}
                    fileFilter="images"
                  />

                  <FileUrlInput
                    label="Company Logo"
                    placeholder="Select your logo"
                    value={logoUrl}
                    onChange={setLogoUrl}
                    fileFilter="images"
                  />

                  <FileUrlInput
                    label="Document/PDF"
                    placeholder="Select any document"
                    value={documentUrl}
                    onChange={setDocumentUrl}
                    fileFilter="all"
                  />

                  <FileUrlInput
                    label="Additional Attachment"
                    placeholder="Select any file type"
                    value={attachmentUrl}
                    onChange={setAttachmentUrl}
                    fileFilter="all"
                  />
                </div>
              </div>

              {/* Preview Section */}
              {hasSelectedFiles && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Selected Files Preview
                      <Badge variant="secondary">{[imageUrl, documentUrl, logoUrl, attachmentUrl].filter(Boolean).length}</Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imageUrl && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Featured Image</Badge>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Image
                              </Badge>
                            </div>
                            <div className="aspect-video bg-background rounded border overflow-hidden">
                              <img
                                src={imageUrl}
                                alt="Featured preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                              {imageUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {logoUrl && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Logo</Badge>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Image
                              </Badge>
                            </div>
                            <div className="aspect-video bg-background rounded border overflow-hidden flex items-center justify-center">
                              <img
                                src={logoUrl}
                                alt="Logo preview"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                              {logoUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {documentUrl && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Document</Badge>
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                File
                              </Badge>
                            </div>
                            <div className="text-center py-8">
                              <p className="text-sm text-muted-foreground">
                                {documentUrl.split('/').pop()}
                              </p>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                              {documentUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {attachmentUrl && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Attachment</Badge>
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                File
                              </Badge>
                            </div>
                            <div className="text-center py-8">
                              <p className="text-sm text-muted-foreground">
                                {attachmentUrl.split('/').pop()}
                              </p>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                              {attachmentUrl}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button type="submit" className="flex-1 h-11">
                  Submit Form
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearForm}
                  className="flex-1 h-11"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features List */}
        <Card className="bg-muted/30 border-0">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">File Manager Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Thumbnail previews for images</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Expandable folder navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Automatic URL generation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>File type filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Drag & drop support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Real-time file management</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}