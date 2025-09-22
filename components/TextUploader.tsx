import React from 'react';
import { UploadIcon } from './icons';

interface TextUploaderProps {
  onUpload: (content: string) => void;
  disabled: boolean;
}

export const TextUploader: React.FC<TextUploaderProps> = ({ onUpload, disabled }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      if (!text.trim()) {
        alert('TXT file appears to be empty.');
        return;
      }
      onUpload(text);
    };
    reader.onerror = () => {
      alert('Failed to read the TXT file.');
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  return (
    <div className="my-4">
      <label
        htmlFor="text-upload"
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 cursor-pointer'}`}
      >
        <UploadIcon />
        <span>Upload TXT</span>
      </label>
      <input
        id="text-upload"
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
};
