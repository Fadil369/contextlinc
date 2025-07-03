'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { useFileUpload, useFileList } from '@/hooks/useAPI';

export function FileUpload() {
  const [localFiles, setLocalFiles] = useState<any[]>([]);
  
  // Use API hooks
  const { uploadFiles, uploading, progress, error: uploadError, uploadedFiles } = useFileUpload();
  const { data: fileList, loading: listLoading, refetch: refetchFiles } = useFileList();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const response = await uploadFiles(acceptedFiles);
      
      // Update local state with upload results
      if (response.results) {
        setLocalFiles(prev => [...prev, ...response.results]);
      }
      
      // Refresh file list from server
      refetchFiles();
      
      console.log(`Successfully uploaded ${acceptedFiles.length} file(s)`);
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  }, [uploadFiles, refetchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.csv'],
      'application/*': ['.pdf', '.docx', '.xlsx', '.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <PhotoIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <VideoCameraIcon className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <MusicalNoteIcon className="w-4 h-4" />;
    return <DocumentIcon className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index: number) => {
    setLocalFiles(files => files.filter((_, i) => i !== index));
  };

  // Combine local files with server file list
  const allFiles = [...localFiles, ...(fileList?.files || [])];

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-700 p-6">
      <h3 className="font-semibold text-white mb-4">Multi-Modal Upload</h3>
      
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary-400 bg-primary-400/10 scale-105'
            : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-400 border-t-transparent"></div>
            </div>
            <p className="text-sm text-dark-300">Uploading files... {progress}%</p>
            {progress > 0 && (
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-primary-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-sm text-dark-300 mb-1">
                {isDragActive ? 'Drop files here...' : 'Drop files here or click to upload'}
              </p>
              <p className="text-xs text-dark-500">
                Supports: Documents, Images, Videos, Audio
              </p>
              <p className="text-xs text-dark-500">
                Max size: 50MB per file
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
          <p className="text-sm text-red-300">{uploadError}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {allFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-dark-300 mb-2">
            Files ({allFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-dark-800 rounded-lg p-3 border border-dark-700"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-primary-400">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.filename || file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-dark-400">
                      <span>{formatFileSize(file.file_size || file.size)}</span>
                      {file.processingStatus && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          file.processingStatus === 'completed' ? 'bg-green-900/30 text-green-300' :
                          file.processingStatus === 'processing' ? 'bg-yellow-900/30 text-yellow-300' :
                          file.processingStatus === 'failed' ? 'bg-red-900/30 text-red-300' :
                          'bg-dark-700 text-dark-400'
                        }`}>
                          {file.processingStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 text-sm ml-2"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Processing Info */}
      <div className="mt-4 text-xs text-dark-500">
        <p>Files are processed through the multi-modal pipeline:</p>
        <ul className="mt-1 space-y-1 list-disc list-inside">
          <li>Format detection & metadata extraction</li>
          <li>Content analysis & embedding generation</li>
          <li>Context integration & semantic indexing</li>
        </ul>
      </div>
    </div>
  );
}