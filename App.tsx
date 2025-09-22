import React, { useState, useEffect, useCallback } from 'react';
import { TextUploader } from './components/TextUploader';
import { JsonUploader } from './components/JsonUploader';
import { RsvpDisplay } from './components/RsvpDisplay';
import { Controls } from './components/Controls';
import { Loader } from './components/Loader';
import { DownloadIcon } from './components/icons';
import { SegmentSettings } from './components/SegmentSettings';
import { segmentText, DEFAULT_SEGMENT_SETTINGS } from './services/mecabService';
import type { Segment, SegmentationSettings } from './types';
import { PresentationState } from './types';

const clampSettings = (settings: SegmentationSettings): SegmentationSettings => {
  const maxSegmentChars = Math.min(32, Math.max(6, Math.round(settings.maxSegmentChars)));
  const minJoinLength = Math.min(
    Math.max(1, Math.round(settings.minJoinLength)),
    Math.max(1, maxSegmentChars - 1)
  );
  return { maxSegmentChars, minJoinLength };
};

function App() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rawText, setRawText] = useState<string | null>(null);
  const [settings, setSettings] = useState<SegmentationSettings>(() => clampSettings(DEFAULT_SEGMENT_SETTINGS));
  const [pendingSettings, setPendingSettings] = useState<SegmentationSettings>(() => clampSettings(DEFAULT_SEGMENT_SETTINGS));
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [presentationState, setPresentationState] = useState<PresentationState>(PresentationState.Idle);
  const [speedMs, setSpeedMs] = useState(400);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentationState !== PresentationState.Presenting || segments.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSegmentIndex((prevIndex) => {
        if (prevIndex >= segments.length - 1) {
          setPresentationState(PresentationState.Finished);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [presentationState, segments.length, speedMs]);

  const resetPresentation = useCallback(() => {
    setPresentationState(PresentationState.Idle);
    setCurrentSegmentIndex(0);
  }, []);

  const processText = useCallback(
    async (text: string, config: SegmentationSettings, loadingLabel = 'Analyzing text with MeCab...') => {
      const trimmed = text.trim();
      if (!trimmed) {
        setSegments([]);
        setError('TXT file appears to be empty.');
        return;
      }

      const normalized = clampSettings(config);

      setIsLoading(true);
      setLoadingMessage(loadingLabel);
      setError(null);

      try {
        const processedSegments = await segmentText(trimmed, normalized);
        setSegments(processedSegments);
        resetPresentation();

        if (processedSegments.length === 0) {
          setError('Could not extract meaningful segments from the text.');
        }
      } catch (err) {
        console.error('Error during segmentation:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze the text.');
      } finally {
        setIsLoading(false);
      }
    },
    [resetPresentation]
  );

  const handleTextUpload = useCallback(
    async (content: string) => {
      if (!content || !content.trim()) {
        setError('TXT file appears to be empty.');
        return;
      }

      setRawText(content);
      await processText(content, settings, 'Analyzing text with MeCab...');
    },
    [processText, settings]
  );

  const handleJsonUpload = useCallback(
    (data: Segment[]) => {
      setSegments(data.map((segment, index) => ({ id: index, text: segment.text })));
      setRawText(null);
      resetPresentation();
      setError(null);
    },
    [resetPresentation]
  );

  const handleDownloadJson = useCallback(() => {
    if (segments.length === 0) return;

    const jsonString = JSON.stringify(segments.map((segment) => segment.text), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvp-segments.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [segments]);

  const handlePlayPause = () => {
    if (segments.length === 0) return;

    if (presentationState === PresentationState.Presenting) {
      setPresentationState(PresentationState.Paused);
    } else if (presentationState === PresentationState.Paused) {
      setPresentationState(PresentationState.Presenting);
    } else {
      if (currentSegmentIndex >= segments.length - 1) {
        setCurrentSegmentIndex(0);
      }
      setPresentationState(PresentationState.Presenting);
    }
  };

  const handleSeek = (index: number) => {
    setCurrentSegmentIndex(index);
  };

  const getDisplayState = () => {
    if (segments.length === 0) {
      return { text: 'Upload a TXT or JSON to begin', label: 'Idle', progress: 0 };
    }

    const currentSegment = segments[currentSegmentIndex];
    if (!currentSegment) {
      return { text: '', label: 'Idle', progress: 0 };
    }

    const overallProgress = segments.length === 0 ? 0 : ((currentSegmentIndex + 1) / segments.length) * 100;

    switch (presentationState) {
      case PresentationState.Presenting:
      case PresentationState.Paused:
        return {
          text: currentSegment.text,
          label: 'Segment',
          progress: overallProgress,
        };
      case PresentationState.Idle:
        return { text: 'Press Play to Start', label: 'Idle', progress: 0 };
      case PresentationState.Finished:
        return { text: 'Finished. Press Play to restart.', label: 'Finished', progress: 100 };
      default:
        return { text: '', label: 'Idle', progress: 0 };
    }
  };

  const { text, label, progress } = getDisplayState();

  const handleSettingsDraftChange = useCallback((next: SegmentationSettings) => {
    setPendingSettings(clampSettings(next));
  }, []);

  const handleApplySettings = useCallback(() => {
    const normalized = clampSettings(pendingSettings);
    setPendingSettings(normalized);
    setSettings(normalized);

    if (rawText && rawText.trim()) {
      void processText(rawText, normalized, 'Applying segmentation settings...');
    }
  }, [pendingSettings, processText, rawText]);

  const settingsDirty =
    settings.maxSegmentChars !== pendingSettings.maxSegmentChars ||
    settings.minJoinLength !== pendingSettings.minJoinLength;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 space-y-6 font-sans">
      {isLoading && <Loader message={loadingMessage} />}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400">RSVP Segment Viewer</h1>
        <p className="text-gray-400 mt-1">Upload TXT &gt; MeCab segments text &gt; Learn at speed.</p>
      </header>

      <RsvpDisplay text={text} progress={progress} label={label} />

      {error && (
        <div className="bg-red-500 bg-opacity-30 text-red-300 p-3 rounded-md max-w-4xl w-full text-center">
          {error}
        </div>
      )}

      <Controls
        speed={speedMs}
        onSpeedChange={setSpeedMs}
        onPlayPause={handlePlayPause}
        presentationState={presentationState}
        disabled={segments.length === 0 || isLoading}
        totalSegments={segments.length}
        currentSegmentIndex={currentSegmentIndex}
        onSeek={handleSeek}
      />

      <div className="w-full max-w-4xl p-4 bg-gray-800 bg-opacity-50 rounded-lg shadow-lg backdrop-blur-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center md:text-left">Data Management</h2>
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-start gap-4">
            <TextUploader onUpload={handleTextUpload} disabled={isLoading} />
            <JsonUploader onUpload={handleJsonUpload} disabled={isLoading} />
            {segments.length > 0 && !isLoading && (
              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DownloadIcon />
                <span>Download JSON</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <SegmentSettings
            settings={pendingSettings}
            onChange={handleSettingsDraftChange}
            onApply={handleApplySettings}
            disabled={isLoading}
            canApplyToCurrent={Boolean(rawText)}
            isDirty={settingsDirty}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

