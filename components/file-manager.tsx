'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Trash2, File, FileText, Image, Archive } from 'lucide-react';
import { toast } from 'sonner';

interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('text/')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileManager() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        toast.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('File uploaded successfully');
        await fetchFiles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/files/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('File download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('File download failed');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('File deleted successfully');
        await fetchFiles();
      } else {
        toast.error('File deletion failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('File deletion failed');
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-[#FF00FF]" />
            <h1 className="text-3xl font-bold font-space-mono text-white">
              File Manager
            </h1>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#003B6F] hover:bg-[#004080] text-white"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="bg-black/40 border-[#722F37]/30">
          <CardHeader>
            <CardTitle className="text-white">Your Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF00FF] mx-auto mb-4" />
                <p className="text-gray-400">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No files uploaded yet. Click the upload button to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-200">File</TableHead>
                    <TableHead className="text-gray-200">Type</TableHead>
                    <TableHead className="text-gray-200">Size</TableHead>
                    <TableHead className="text-gray-200">Uploaded</TableHead>
                    <TableHead className="text-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.mime_type);
                    return (
                      <TableRow key={file.id}>
                        <TableCell className="text-white">
                          <div className="flex items-center space-x-3">
                            <FileIcon className="h-5 w-5 text-[#003B6F]" />
                            <span className="truncate max-w-xs">{file.original_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-gray-300">
                            {file.mime_type.split('/')[1]?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatFileSize(file.file_size)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(file.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadFile(file.id, file.original_name)}
                              className="text-[#003B6F] border-[#003B6F] hover:bg-[#003B6F]/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteFile(file.id)}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}