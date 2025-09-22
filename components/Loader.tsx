
import React from 'react';

export const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
      <p className="mt-4 text-lg text-cyan-300 font-semibold">{message}</p>
    </div>
  );
};
