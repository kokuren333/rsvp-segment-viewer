import React from 'react';
import type { SegmentationSettings } from '../types';

interface SegmentSettingsProps {
  settings: SegmentationSettings;
  onChange: (settings: SegmentationSettings) => void;
  onApply: () => void;
  disabled?: boolean;
  canApplyToCurrent: boolean;
  isDirty: boolean;
}

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

const MIN_MAX_SEGMENT = 6;
const MAX_MAX_SEGMENT = 32;

export const SegmentSettings: React.FC<SegmentSettingsProps> = ({
  settings,
  onChange,
  onApply,
  disabled = false,
  canApplyToCurrent,
  isDirty,
}) => {
  const updateMaxSegmentChars = (value: number) => {
    const maxSegmentChars = clamp(value, MIN_MAX_SEGMENT, MAX_MAX_SEGMENT);
    const minJoinLength = clamp(settings.minJoinLength, 1, Math.max(1, maxSegmentChars - 1));
    onChange({ ...settings, maxSegmentChars, minJoinLength });
  };

  const updateMinJoinLength = (value: number) => {
    const upperBound = Math.max(1, settings.maxSegmentChars - 1);
    const minJoinLength = clamp(value, 1, upperBound);
    onChange({ ...settings, minJoinLength });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max segment length
          <span className="ml-2 text-cyan-300 font-semibold">{settings.maxSegmentChars}</span>
          <span className="ml-1 text-xs text-gray-500">characters</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={MIN_MAX_SEGMENT}
            max={MAX_MAX_SEGMENT}
            step={1}
            value={settings.maxSegmentChars}
            onChange={(event) => updateMaxSegmentChars(Number(event.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="number"
            min={MIN_MAX_SEGMENT}
            max={MAX_MAX_SEGMENT}
            value={settings.maxSegmentChars}
            onChange={(event) => updateMaxSegmentChars(Number(event.target.value))}
            disabled={disabled}
            className="w-16 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum length to keep separate
          <span className="ml-2 text-cyan-300 font-semibold">{settings.minJoinLength}</span>
          <span className="ml-1 text-xs text-gray-500">characters</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={Math.max(1, settings.maxSegmentChars - 1)}
            step={1}
            value={settings.minJoinLength}
            onChange={(event) => updateMinJoinLength(Number(event.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="number"
            min={1}
            max={Math.max(1, settings.maxSegmentChars - 1)}
            value={settings.minJoinLength}
            onChange={(event) => updateMinJoinLength(Number(event.target.value))}
            disabled={disabled}
            className="w-16 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Shorter chunks than this will try to merge into the previous segment when room allows.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-gray-400">
          {canApplyToCurrent
            ? 'Changes apply immediately to the current TXT when you press Apply.'
            : 'Upload a TXT file to re-run segmentation with these settings.'}
        </div>
        <button
          onClick={onApply}
          disabled={disabled || !isDirty}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
            disabled || !isDirty
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500'
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
};
