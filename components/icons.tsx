import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
};

export const PlayIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);

export const PauseIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" />
  </svg>
);

export const NextIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M6 18L14.5 12L6 6V18ZM16 6V18H18V6H16Z" />
  </svg>
);

export const PrevIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M18 18V6L9.5 12L18 18ZM8 6H6V18H8V6Z" />
  </svg>
);

export const UploadIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
    </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
);