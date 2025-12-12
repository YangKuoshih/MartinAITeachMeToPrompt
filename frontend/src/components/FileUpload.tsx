import React, { useState, useRef } from 'react';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    s3Key?: string;
    progress: number;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    error?: string;
}

interface FileUploadProps {
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
    maxFiles?: number;
    maxSizeBytes?: number;
}

const FILE_ICONS: Record<string, string> = {
    'application/pdf': '📄',
    'image/png': '🖼️',
    'image/jpeg': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'text/csv': '📊',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'text/plain': '📝',
    'application/json': '💻',
    'application/msword': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
};

const ALLOWED_TYPES = [
    'application/pdf',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'text/csv', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const FileUpload: React.FC<FileUploadProps> = ({
    files,
    onFilesChange,
    maxFiles = 10,
    maxSizeBytes = 10 * 1024 * 1024 // 10MB
}) => {
    const { isDarkMode } = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: string): string => {
        return FILE_ICONS[type] || '📎';
    };

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Unsupported file type: ${file.type}`;
        }
        if (file.size > maxSizeBytes) {
            return `File too large. Max size: ${formatFileSize(maxSizeBytes)}`;
        }
        if (files.length >= maxFiles) {
            return `Maximum ${maxFiles} files allowed`;
        }
        return null;
    };

    const uploadFile = async (file: File, fileId: string) => {
        try {
            // Update status to uploading
            updateFile(fileId, { status: 'uploading', progress: 0 });

            // Get presigned URL from backend
            const { uploadUrl, key } = await API.post('/upload-url', {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            // Upload to S3 with progress tracking
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 100);
                        updateFile(fileId, { progress });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        resolve();
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

            // Mark as uploaded with S3 key
            updateFile(fileId, { status: 'uploaded', progress: 100, s3Key: key });
        } catch (error: any) {
            updateFile(fileId, { status: 'error', error: error.message || 'Upload failed' });
        }
    };

    const processFiles = async (fileList: FileList | File[]) => {
        const filesToProcess = Array.from(fileList);
        const newFiles: UploadedFile[] = [];

        for (const file of filesToProcess) {
            const error = validateFile(file);
            if (error) {
                alert(error);
                continue;
            }

            const newFile: UploadedFile = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                status: 'pending'
            };

            newFiles.push(newFile);
        }

        if (newFiles.length > 0) {
            onFilesChange([...files, ...newFiles]);

            // Upload each file
            for (let i = 0; i < newFiles.length; i++) {
                await uploadFile(filesToProcess[i], newFiles[i].id);
            }
        }
    };

    const updateFile = (id: string, updates: Partial<UploadedFile>) => {
        onFilesChange(files.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeFile = (id: string) => {
        onFilesChange(files.filter(f => f.id !== id));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = ''; // Reset input
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input Button */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center space-x-2 ${isDragging
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : isDarkMode
                            ? 'border-gray-600 hover:border-purple-500 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-300 hover:border-purple-500 bg-gray-50 hover:bg-gray-100'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span className="text-2xl">➕</span>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {isDragging ? 'Drop files here' : 'Add Files'}
                </span>
            </button>

            {/* Helper Text */}
            {files.length === 0 && (
                <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supports: PDF, images, CSV, Excel, Word, text files (max 10MB each)
                </p>
            )}

            {/* File Preview Cards */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        📎 Attached Files ({files.length})
                    </p>
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {file.name}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatFileSize(file.size)}
                                            {file.status === 'uploaded' && ' • Uploaded'}
                                            {file.status === 'uploading' && ` • Uploading ${file.progress}%`}
                                            {file.status === 'error' && ` • Error: ${file.error}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className={`ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
                                        }`}
                                    title="Remove file"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {file.status === 'uploading' && (
                                <div className="mt-2">
                                    <div className={`h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        <div
                                            className="h-full bg-purple-600 transition-all duration-300"
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
