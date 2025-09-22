export interface Segment {
  id: number;
  text: string;
}

export interface SegmentationSettings {
  maxSegmentChars: number;
  minJoinLength: number;
}

export enum PresentationState {
  Idle,
  Presenting,
  Paused,
  Finished,
}
