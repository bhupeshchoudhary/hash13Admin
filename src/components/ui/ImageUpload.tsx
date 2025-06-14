'use client';

import { useState } from 'react';
import { CourseService } from '@/lib/courseService';
import { Upload, X, Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void;
  folder?: string;
  maxFiles?: number;
}

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

export default function ImageUpload({ 
  onImageUploaded, 
  folder = 'uploads',
  maxFiles = 10 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        console.log('Uploading file:', file.name);
        
        const response = await CourseService.uploadImage(file, folder);
        
        if (response.success && response.url) {
          const uploadedImage: UploadedImage = {
            id: Math.random().toString(36).substring(2, 15),
            url: response.url,
            filename: file.name,
            size: file.size,
            uploadedAt: new Date()
          };
          
          return uploadedImage;
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful: UploadedImage[] = [];
      const failed: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push(files[index].name);
        }
      });

      if (successful.length > 0) {
        setUploadedImages(prev => [...prev, ...successful]);
        toast.success(`${successful.length} image(s) uploaded successfully`);
        
        // Call the callback for the first uploaded image
        if (onImageUploaded && successful[0]) {
          onImageUploaded(successful[0].url);
        }
      }

      if (failed.length > 0) {
        toast.error(`Failed to upload: ${failed.join(', ')}`);
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy URL');
    }
  };

  const deleteImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    toast.success('Image removed from list');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearAll = () => {
    setUploadedImages([]);
    toast.success('All images cleared');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Image Upload Manager</h3>
          <p className="text-sm text-gray-600">
            Upload images and copy their URLs for use in courses
          </p>
        </div>
        {uploadedImages.length > 0 && (
          <button
            onClick={clearAll}
            className="btn-secondary text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 mb-2 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Uploaded Images ({uploadedImages.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg border"
              >
                {/* Image Preview */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                {/* Image Info */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(image.size)} • {image.uploadedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={image.url}
                      readOnly
                      className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(image.url)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === image.url ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from list"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">How to use:</h5>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload your images using the upload area above</li>
          <li>Copy the generated URL by clicking the copy button</li>
          <li>Paste the URL into your course form's image URL field</li>
          <li>The image will be displayed in your course</li>
        </ol>
      </div>
    </div>
  );
}