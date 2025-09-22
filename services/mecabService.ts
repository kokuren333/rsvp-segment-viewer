import type { Segment, SegmentationSettings } from '../types';

type MecabToken = {
  word: string;
  pos: string;
  pos_detail1: string;
  pos_detail2: string;
  pos_detail3: string;
  conjugation1: string;
  conjugation2: string;
  dictionary_form: string;
  reading: string;
  pronunciation: string;
};

type MecabModule = {
  waitReady: () => Promise<void>;
  query: (text: string) => MecabToken[];
};

const HARD_BOUNDARY_REGEX = /[\u3002\uFF01\uFF1F?!]/;
const SOFT_BOUNDARY_REGEX = /[\u3001\uFF0C,\u30FB\uFF1B;]/;
const PUNCT_ONLY_REGEX = /^[\u3002\uFF01\uFF1F?!\u3001\uFF0C,\u30FB\uFF1B;]+$/;
const POS_SYMBOL = '\u8A18\u53F7';
const DETAIL_PERIOD = '\u53E5\u70B9';
const DETAIL_COMMA = '\u8AAD\u70B9';
const POS_PARTICLE = '\u52A9\u8A5E';
const DETAIL_ENDING_PARTICLE = '\u7D42\u52A9\u8A5E';
const DETAIL_CASE_PARTICLE = '\u683C\u52A9\u8A5E';
const POS_AUX_VERB = '\u52A9\u52D5\u8A5E';
const PLACEHOLDER_DESU = '\u3067\u3059';

export const DEFAULT_SEGMENT_SETTINGS: SegmentationSettings = {
  maxSegmentChars: 16,
  minJoinLength: 4,
};

let mecabModulePromise: Promise<MecabModule> | null = null;

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

const sanitizeInput = (input: string): string =>
  input
    .replace(/\r\n/g, '\n')
    .replace(/\u3000/g, ' ')
    .replace(/[\t]+/g, ' ')
    .trim();

const normalizeSettings = (settings?: Partial<SegmentationSettings>): SegmentationSettings => {
  const base = { ...DEFAULT_SEGMENT_SETTINGS, ...(settings ?? {}) };
  const maxSegmentChars = clamp(Math.round(base.maxSegmentChars), 6, 32);
  const minJoinLength = clamp(Math.round(base.minJoinLength), 1, Math.max(1, maxSegmentChars - 1));
  return { maxSegmentChars, minJoinLength };
};

const deriveSoftBreakThreshold = (maxSegmentChars: number): number => {
  const approx = Math.round(maxSegmentChars / 3);
  const upper = Math.max(3, maxSegmentChars - 2);
  return clamp(approx, 3, upper);
};

const loadMecab = async (): Promise<MecabModule> => {
  if (!mecabModulePromise) {
    mecabModulePromise = import('mecab-wasm/lib/mecab.js').then(async (module: any) => {
      const mecab: MecabModule = module.default;
      await mecab.waitReady();
      return mecab;
    });
  }

  return mecabModulePromise;
};

const characterLength = (value: string): number => Array.from(value).length;

const flushBuffer = (
  segments: Segment[],
  buffer: string[],
  idRef: { current: number },
  currentLength: { value: number }
) => {
  const text = buffer.join('').replace(/\s+/g, ' ').trim();
  buffer.length = 0;
  currentLength.value = 0;

  if (!text) {
    return;
  }

  segments.push({
    id: idRef.current++,
    text,
  });
};

const isHardBoundary = (token: MecabToken): boolean => {
  if (token.pos === POS_SYMBOL && (token.pos_detail1 === DETAIL_PERIOD || token.pos_detail1 === DETAIL_COMMA)) {
    return true;
  }

  return HARD_BOUNDARY_REGEX.test(token.word);
};

const isSoftBoundary = (token: MecabToken): boolean => {
  if (token.pos === POS_PARTICLE && (token.pos_detail1 === DETAIL_ENDING_PARTICLE || token.pos_detail1 === DETAIL_CASE_PARTICLE)) {
    return true;
  }

  if (token.pos === POS_AUX_VERB && token.word === PLACEHOLDER_DESU) {
    return true;
  }

  return SOFT_BOUNDARY_REGEX.test(token.word);
};

const splitOversizedText = (text: string, maxSegmentChars: number): string[] => {
  const chunks: string[] = [];
  let current = '';
  for (const char of Array.from(text)) {
    current += char;
    if (characterLength(current) >= maxSegmentChars) {
      chunks.push(current);
      current = '';
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks;
};

const postProcessSegments = (rawSegments: Segment[], settings: SegmentationSettings): Segment[] => {
  const mergedTexts: string[] = [];

  const appendText = (text: string) => {
    const pieces = splitOversizedText(text, settings.maxSegmentChars);
    for (const piece of pieces) {
      mergedTexts.push(piece);
    }
  };

  for (const segment of rawSegments) {
    const trimmed = segment.text.trim();
    if (!trimmed) {
      continue;
    }

    if (PUNCT_ONLY_REGEX.test(trimmed)) {
      if (mergedTexts.length === 0) {
        appendText(trimmed);
      } else {
        const last = mergedTexts[mergedTexts.length - 1];
        const combined = `${last}${trimmed}`;
        if (characterLength(combined) <= settings.maxSegmentChars + 1) {
          mergedTexts[mergedTexts.length - 1] = combined;
        } else {
          appendText(trimmed);
        }
      }
      continue;
    }

    if (characterLength(trimmed) < settings.minJoinLength && mergedTexts.length > 0) {
      const last = mergedTexts[mergedTexts.length - 1];
      if (characterLength(last) + characterLength(trimmed) <= settings.maxSegmentChars) {
        mergedTexts[mergedTexts.length - 1] = `${last}${trimmed}`;
        continue;
      }
    }

    appendText(trimmed);
  }

  return mergedTexts.map((text, index) => ({ id: index, text }));
};

export const segmentText = async (
  rawText: string,
  overrideSettings?: Partial<SegmentationSettings>
): Promise<Segment[]> => {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const mecab = await loadMecab();
  const sanitized = sanitizeInput(rawText);

  if (!sanitized) {
    return [];
  }

  const settings = normalizeSettings(overrideSettings);
  const softBreakThreshold = deriveSoftBreakThreshold(settings.maxSegmentChars);

  const segments: Segment[] = [];
  const buffer: string[] = [];
  const idRef = { current: 0 };
  const currentLength = { value: 0 };

  const flush = () => flushBuffer(segments, buffer, idRef, currentLength);

  const paragraphs = sanitized.split(/\n+/);

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      flush();
      continue;
    }

    const tokens = mecab.query(trimmedParagraph);
    if (!Array.isArray(tokens) || tokens.length === 0) {
      flush();
      continue;
    }

    tokens.forEach((token, index) => {
      const surface = (token.word || '').trim();
      if (!surface) {
        return;
      }

      const tokenLength = characterLength(surface);
      const hardBoundaryToken = isHardBoundary(token);
      const willExceed = currentLength.value > 0 && currentLength.value + tokenLength > settings.maxSegmentChars;

      if (willExceed && !hardBoundaryToken) {
        flush();
      }

      buffer.push(surface);
      currentLength.value += tokenLength;

      const lastTokenInParagraph = index === tokens.length - 1;
      const lengthReached = currentLength.value >= settings.maxSegmentChars;
      const softBreak = !hardBoundaryToken && isSoftBoundary(token) && currentLength.value >= softBreakThreshold;

      if (hardBoundaryToken || lengthReached || softBreak || lastTokenInParagraph) {
        flush();
      }
    });

    flush();
  }

  flush();

  return postProcessSegments(segments, settings);
};
