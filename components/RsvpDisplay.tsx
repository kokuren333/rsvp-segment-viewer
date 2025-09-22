import React from 'react';

interface RsvpDisplayProps {
  text: string;
  progress: number;
  label: string;
}

export const RsvpDisplay: React.FC<RsvpDisplayProps> = ({ text, progress, label }) => {
  return (
    <div className="w-full max-w-4xl h-64 bg-gray-800 rounded-lg shadow-2xl flex flex-col items-center justify-center relative p-4">
      <div className="absolute top-2 right-4 text-sm font-mono text-cyan-400">
        {label}
      </div>
      <div className="text-5xl md:text-7xl font-bold text-center text-gray-50 flex items-center justify-center h-full w-full">
        {text}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700 rounded-b-lg">
        <div
          className="h-2 bg-cyan-500 rounded-b-lg transition-all duration-150 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};
