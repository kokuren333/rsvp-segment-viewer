import React from 'react';
import type { Segment } from '../types';
import { UploadIcon } from './icons';

interface JsonUploaderProps {
  onUpload: (data: Segment[]) => void;
  disabled: boolean;
}

const normalizeToSegments = (data: unknown): Segment[] => {
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array.');
  }

  if (data.every((item) => typeof item === 'string')) {
    return (data as string[]).map((text, index) => ({ id: index, text }));
  }

  const segments = data
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const textValue = (item as { text?: unknown }).text;
      if (typeof textValue !== 'string') {
        return null;
      }

      return {
        id: typeof (item as { id?: unknown }).id === 'number' ? (item as { id: number }).id : index,
        text: textValue,
      };
    })
    .filter((segment): segment is Segment => Boolean(segment && segment.text.trim().length > 0));

  if (segments.length === 0) {
    throw new Error('JSON does not contain valid segment entries.');
  }

  return segments.map((segment, index) => ({ id: index, text: segment.text }));
};

export const JsonUploader: React.FC<JsonUploaderProps> = ({ onUpload, disabled }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const data = JSON.parse(text);
        const segments = normalizeToSegments(data);
        onUpload(segments);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Failed to parse JSON file. Please check the format.');
      }
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  return (
    <div>
      <label
        htmlFor="json-upload"
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer'}`}
      >
        <UploadIcon />
        <span>Upload JSON</span>
      </label>
      <input
        id="json-upload"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
};
