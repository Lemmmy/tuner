import { quantileSorted } from "d3-array";
import { Macleod } from "pitchfinder-low";
import { ProbabalisticPitchDetector } from "pitchfinder-low/lib/detectors/types";
import { RefObject } from "react";
import { freqToMidiNote, midiNoteToCents } from "./midi.ts";
import { addLockedInDetection, Detection, LockedInDetection, setDetected, start, stop } from "./state/audioSlice.ts";
import { store } from "./state/store.ts";
import { renderFreqCanvas } from "./viz/frequencyVizRender.ts";
import { renderPitchDisplay } from "./viz/pitchDisplayRender.tsx";

export class AudioShenanigans {
  private ctx: AudioContext;
  private analyzer: AnalyserNode | null = null;
  private lpf: BiquadFilterNode | null = null;
  private timeBuf: Float32Array = new Float32Array(0);
  private freqBuf: Uint8Array = new Uint8Array(0);

  private readonly pitchFinder: ProbabalisticPitchDetector;
  private lastDetection: Detection | null = null;

  private pendingLockInStartTime: number | null = null;
  private pendingLockInDetections: Detection[] = [];

  constructor(
    private readonly freqCanvas: RefObject<HTMLCanvasElement>,
    private readonly freqVizCanvas: RefObject<HTMLCanvasElement>,
    sampleRate: number,
    cutoff: number,
    private fftSize: number,
  ) {
    this.ctx = new AudioContext({ sampleRate });

    this.pitchFinder = Macleod({
      bufferSize: fftSize,
      cutoff,
      sampleRate
    });
  }

  async start() {
    await this.ctx.resume();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.ctx.createMediaStreamSource(stream);

    const lpf = this.lpf = this.ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.Q.value = 0.6;
    source.connect(lpf);

    const analyzer = this.analyzer = this.ctx.createAnalyser();
    analyzer.fftSize = this.fftSize;
    lpf.connect(analyzer);

    this.timeBuf = new Float32Array(analyzer.fftSize);
    this.freqBuf = new Uint8Array(analyzer.frequencyBinCount);

    store.dispatch(start());
    requestAnimationFrame(this.tick.bind(this));
  }

  tick() {
    const { audio, options } = store.getState();
    if (!audio.running || !this.analyzer || !this.lpf) {
      // Clear the canvases if the audio is not running
      renderPitchDisplay(this.freqCanvas, null, null);
      renderFreqCanvas(this.freqVizCanvas, this.ctx.sampleRate, options, null, null);
      return;
    }

    this.lpf.frequency.value = options.lpf;
    this.analyzer.getFloatTimeDomainData(this.timeBuf);
    this.analyzer.getByteFrequencyData(this.freqBuf);

    const { probability, freq } = this.pitchFinder(this.timeBuf);
    const now = Date.now();
    const midiNote = freqToMidiNote(freq, options.referenceFreq);

    const lastDetection = this.lastDetection;
    const differenceToLastDetection = lastDetection
      ? Math.abs(Math.round(freq) - Math.round(lastDetection.freq))
      : 0;

    const valid = freq >= options.minFreq
      && freq <= options.maxFreq
      && midiNote >= options.minNote
      && midiNote <= options.maxNote
      && probability >= options.probThres
      && differenceToLastDetection <= 2; // Allow for a 2 semitone difference before timeout

    if (valid) {
      const detection: Detection = {
        freq,
        midiNote,
        probability,
        time: now
      };

      this.lastDetection = detection;
      store.dispatch(setDetected(detection));

      // If the detected note is the same as the last one, add it to the locked-in list
      if (lastDetection && differenceToLastDetection === 0) {
        this.pendingLockInDetections.push(detection);
      } else {
        this.pendingLockInDetections = [detection];
        this.pendingLockInStartTime = now;
      }

      // If the detected note has been locked in for 500ms, log a LockedInDetection. Calculate the average frequency,
      // the interquartile range, and the interquartile mean.
      if (this.pendingLockInStartTime != null && now - this.pendingLockInStartTime > options.lockInMs) {
        const sortedFreqs = this.pendingLockInDetections.slice()
          .sort((a, b) => a.freq - b.freq)
          .map(d => d.freq);

        const q1 = quantileSorted(sortedFreqs, 0.25)!;
        const q2 = quantileSorted(sortedFreqs, 0.5)!;
        const q3 = quantileSorted(sortedFreqs, 0.75)!;

        const q1Note = freqToMidiNote(q1, options.referenceFreq);
        const q2Note = freqToMidiNote(q2, options.referenceFreq);
        const q3Note = freqToMidiNote(q3, options.referenceFreq);

        const lockedInDetection: LockedInDetection = {
          startTime: this.pendingLockInStartTime,
          endTime: now,
          detections: this.pendingLockInDetections,
          q1, q1Cents: midiNoteToCents(q1Note),
          q2, q2Cents: midiNoteToCents(q2Note),
          q3, q3Cents: midiNoteToCents(q3Note),
          midiNote: q2Note,
        };

        console.log(lockedInDetection);

        // Clear the locked-in state
        this.pendingLockInStartTime = null;
        this.pendingLockInDetections = [];
        store.dispatch(addLockedInDetection(lockedInDetection));
      }
    } else if (lastDetection && now - lastDetection.time > options.timeoutMs) {
      // If the last valid detection was more than 500ms ago, reset the detected note
      this.lastDetection = null;
      this.pendingLockInStartTime = null;
      this.pendingLockInDetections = [];
      store.dispatch(setDetected(null));
    }

    renderPitchDisplay(this.freqCanvas, this.pendingLockInDetections, this.lastDetection);
    renderFreqCanvas(this.freqVizCanvas, this.ctx.sampleRate, options, this.lastDetection, this.freqBuf);

    requestAnimationFrame(this.tick.bind(this));
  }

  async stop() {
    await this.ctx.suspend();
    this.freqBuf.fill(0);
    this.timeBuf.fill(0);
    this.lastDetection = null;
    this.pendingLockInStartTime = null;
    this.pendingLockInDetections = [];
    store.dispatch(stop());
  }
}
