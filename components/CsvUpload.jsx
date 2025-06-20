'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CsvUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => file.type === 'text/csv');
    if (validFiles.length) {
      setSelectedFiles(validFiles);
      setUploadResult([]);
    } else {
      toast.error('Please select valid CSV files');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!selectedFiles.length || !user) return;

    setUploading(true);
    const results = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        const response = await fetch('/api/csv/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          results.push({
            fileName: file.name,
            ...result,
          });
        } else {
          results.push({
            fileName: file.name,
            error: result.error || 'Upload failed',
          });
        }
      }

      setUploadResult(results);
      toast.success('All files processed');
    } catch (error) {
      toast.error('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setUploadResult([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CSV Upload</h1>
        <p className="text-gray-600 mt-2">Upload sales data from your vending machine providers</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV Files</CardTitle>
          <CardDescription>
            Select one or more CSV files from Vendor A or Vendor B. Format will be auto-detected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFiles.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the CSV files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop CSV files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports both Vendor A and Vendor B formats
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Remove All
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing CSV files...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult.length > 0 && uploadResult.map((result, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {result.error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  {result.fileName} - Failed
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  {result.fileName} - Processed
                </>
              )}
            </CardTitle>
            <CardDescription>
              {result.error ? result.error : `Format: ${result.vendorFormat}`}
            </CardDescription>
          </CardHeader>
          {!result.error && (
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.processedRows}</div>
                  <div className="text-sm text-gray-600">Processed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.failedRows}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                    Processing Errors ({result.errors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-gray-600 mb-1">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="text-sm text-gray-500 italic">
                        ... and {result.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
