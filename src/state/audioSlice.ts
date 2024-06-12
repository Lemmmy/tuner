import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Detection {
  freq: number;
  midiNote: number;
  probability: number;
  time: number;
}

export interface LockedInDetection {
  startTime: number;
  endTime: number;
  detections: Detection[];
  q1: number;
  q2: number;
  q3: number;
  q1Cents: number;
  q2Cents: number;
  q3Cents: number;
  midiNote: number;
}

export interface AudioState {
  running: boolean;
  detected: Detection | null;
  lockedInDetections: Record<string, LockedInDetection>;
}

const initialState: AudioState = {
  running: false,
  detected: null,
  lockedInDetections: {},
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    start(state) { state.running = true; },
    stop(state) { state.running = false; },
    setDetected(state, action: PayloadAction<Detection | null>) {
      state.detected = action.payload;
    },
    clearLockedInDetections(state) {
      state.lockedInDetections = {};
    },
    addLockedInDetection(state, action: PayloadAction<LockedInDetection>) {
      state.lockedInDetections[Math.round(action.payload.midiNote).toString()] = action.payload;
    },
  },
});

export const {
  start, stop, setDetected, clearLockedInDetections, addLockedInDetection
} = audioSlice.actions;
