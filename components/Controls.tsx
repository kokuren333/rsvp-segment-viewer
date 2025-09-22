import React from 'react';
import { PresentationState } from '../types';
import { PlayIcon, PauseIcon } from './icons';

interface ControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  onPlayPause: () => void;
  presentationState: PresentationState;
  disabled: boolean;
  totalSegments: number;
  currentSegmentIndex: number;
  onSeek: (index: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  speed,
  onSpeedChange,
  onPlayPause,
  presentationState,
  disabled,
  totalSegments,
  currentSegmentIndex,
  onSeek,
}) => {
  const isPlaying = presentationState === PresentationState.Presenting;

  return (
    <div className="w-full max-w-4xl p-4 bg-gray-800 bg-opacity-50 rounded-lg shadow-lg backdrop-blur-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full">
            <label htmlFor="progress-slider" className="block text-sm font-medium text-gray-300 mb-1">
                Progress: {disabled ? '0 / 0' : `${currentSegmentIndex + 1} / ${totalSegments}`}
            </label>
            <input
                id="progress-slider"
                type="range"
                min="0"
                max={totalSegments > 0 ? totalSegments - 1 : 0}
                value={currentSegmentIndex}
                onChange={(e) => onSeek(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        <div className="w-full md:w-1/3">
            <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-300 mb-1">
                Speed: {speed} ms/phrase
            </label>
            <input
                id="speed-slider"
                type="range"
                min="50"
                max="500"
                step="10"
                value={speed}
                onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button onClick={onPlayPause} disabled={disabled} className="p-4 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-white">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  );
};
