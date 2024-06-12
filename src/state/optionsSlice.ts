import { createSlice } from "@reduxjs/toolkit";
import { midiNameToNote } from "../midi.ts";
import { lsGetNumber } from "../utils.ts";

export interface OptionsState {
  // Tuner options
  referenceFreq: number;
  minNote      : number;
  maxNote      : number;

  // Detection options
  cutoff   : number;
  probThres: number;
  timeoutMs: number;
  lockInMs : number;

  // Audio options
  sampleRate: number;
  fftSize   : number;
  minFreq   : number;
  maxFreq   : number;
  lpf       : number;
}

export const defaultState: OptionsState = {
  referenceFreq: 440,
  minNote      : midiNameToNote("F3"),
  maxNote      : midiNameToNote("C6"),

  cutoff   : 0.93,
  probThres: 0.95,
  timeoutMs: 250,
  lockInMs : 500,

  sampleRate: 16000,
  fftSize   : 4096,
  minFreq   : 60,
  maxFreq   : 4200,
  lpf       : 2000,
}

export const initialState: OptionsState = {
  referenceFreq: lsGetNumber("referenceFreq", defaultState.referenceFreq),
  minNote      : lsGetNumber("minNote"      , defaultState.minNote),
  maxNote      : lsGetNumber("maxNote"      , defaultState.maxNote),

  cutoff   : lsGetNumber("cutoff"   , defaultState.cutoff),
  probThres: lsGetNumber("probThres", defaultState.probThres),
  timeoutMs: lsGetNumber("timeoutMs", defaultState.timeoutMs),
  lockInMs : lsGetNumber("lockInMs" , defaultState.lockInMs),

  sampleRate: lsGetNumber("sampleRate", defaultState.sampleRate),
  fftSize   : lsGetNumber("fftSize"   , defaultState.fftSize),
  minFreq   : lsGetNumber("minFreq"   , defaultState.minFreq),
  maxFreq   : lsGetNumber("maxFreq"   , defaultState.maxFreq),
  lpf       : lsGetNumber("lpf"       , defaultState.lpf),
};

export const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setReferenceFreq: (state, action) => { state.referenceFreq = action.payload; },
    setMinNote      : (state, action) => { state.minNote       = action.payload; },
    setMaxNote      : (state, action) => { state.maxNote       = action.payload; },

    setCutoff   : (state, action) => { state.cutoff    = action.payload; },
    setProbThres: (state, action) => { state.probThres = action.payload; },
    setTimeoutMs: (state, action) => { state.timeoutMs = action.payload; },
    setLockInMs : (state, action) => { state.lockInMs  = action.payload; },

    setSampleRate: (state, action) => { state.sampleRate = action.payload; },
    setFftSize   : (state, action) => { state.fftSize    = action.payload; },
    setMinFreq   : (state, action) => { state.minFreq    = action.payload; },
    setMaxFreq   : (state, action) => { state.maxFreq    = action.payload; },
    setLpf       : (state, action) => { state.lpf        = action.payload; },
  },
});

export const {
  setReferenceFreq, setMinNote, setMaxNote,
  setCutoff, setProbThres, setTimeoutMs, setLockInMs,
  setSampleRate, setFftSize, setMinFreq, setMaxFreq, setLpf,
} = optionsSlice.actions;
