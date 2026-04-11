import React, { useCallback } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertTriangle, FileAudio } from 'lucide-react';

interface FileUploadZoneProps {
  label: string;
  acceptedMimeTypes: string[];
  maxSizeBytes: number;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  iconType?: 'document' | 'audio';
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  label,
  acceptedMimeTypes,
  maxSizeBytes,
  selectedFile,
  onFileSelect,
  iconType = 'document'
}) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (!acceptedMimeTypes.includes(file.type) && !acceptedMimeTypes.some(ext => file.name.endsWith(ext.replace('.', '')))) {
      setErrorMsg(`Invalid file type. Please upload a supported format.`);
      return;
    }
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      setErrorMsg(`Your file is ${sizeMB}MB — max is ${maxMB}MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [acceptedMimeTypes, maxSizeBytes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const PrimaryIcon = iconType === 'audio' ? FileAudio : FileType;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors h-[250px]
            ${isDragActive ? 'border-teal-400 bg-teal-900/20' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-teal-500/50'}
            ${errorMsg ? 'border-coral-500 bg-coral-900/10' : ''}
          `}
        >
          <input
            type="file"
            className="hidden"
            accept={acceptedMimeTypes.join(',')}
            onChange={handleChange}
          />
          <UploadCloud className="w-12 h-12 text-teal-400 mb-4 opacity-80" />
          <p className="text-slate-200 font-medium text-lg">Click to upload or drag & drop</p>
          <p className="text-slate-400 text-sm mt-2 text-center max-w-[300px]">
            Max size: {Math.round(maxSizeBytes / (1024 * 1024))}MB
          </p>
          
          {errorMsg && (
            <div className="mt-4 flex items-center space-x-2 text-red-400 text-sm font-medium bg-red-900/20 px-4 py-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-teal-500/30 bg-teal-900/10 rounded-2xl h-[250px] relative">
          <PrimaryIcon className="w-16 h-16 text-teal-400 mb-4" />
          <p className="text-slate-200 font-bold truncate max-w-xs">{selectedFile.name}</p>
          <p className="text-teal-400 font-medium text-sm mt-1">
            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Ready
          </p>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onFileSelect(null); }}
            className="mt-6 px-4 py-2 text-sm font-medium text-slate-300 border border-slate-600 rounded hover:bg-slate-700 hover:text-white transition-colors"
          >
            Replace File
          </button>
          
          <div className="absolute top-4 right-4">
             <CheckCircle className="w-6 h-6 text-teal-400" />
          </div>
        </div>
      )}
    </div>
  );
};
