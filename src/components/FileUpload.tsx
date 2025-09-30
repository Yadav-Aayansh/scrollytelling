import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { getAppConfig } from '../utils/config';

interface FileUploadProps {
  onFileUpload: (file: File, csvContent: string) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appConfig, setAppConfig] = useState<any>(null);

  React.useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const config = await getAppConfig();
        setAppConfig(config);
      } catch (error) {
        console.error('Failed to load app config:', error);
      }
    };

    loadAppConfig();
  }, []);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  };

  const processFile = async (file: File) => {
    if (isProcessing) return;
    
    const supportedFormats = appConfig?.supportedFormats || ['.csv'];
    const isSupported = supportedFormats.some(format => 
      file.name.toLowerCase().endsWith(format.toLowerCase())
    );
    
    if (!isSupported) {
      alert(`Please upload a supported file format: ${supportedFormats.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      const content = await readFileAsText(file);
      setSelectedFile(file);
      onFileUpload(file, content);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading the CSV file. Please try again.');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isProcessing) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isProcessing) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (disabled || isProcessing) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    if (isProcessing) return;
    
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Upload className="h-5 w-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Upload CSV File</h2>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isProcessing}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${isProcessing ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isProcessing ? 'Processing file...' : 'Drop your CSV file here, or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            Supports {appConfig?.supportedFormats?.join(', ') || 'CSV files'} up to {appConfig?.maxFileSize || '10MB'}
          </p>
        </div>
      )}
    </div>
  );
};