import {
  setCutoff,
  setFftSize,
  setLockInMs,
  setLpf,
  setMaxFreq,
  setMaxNote,
  setMinFreq,
  setMinNote,
  setProbThres,
  setReferenceFreq,
  setSampleRate,
  setTimeoutMs
} from "../state/optionsSlice.ts";
import { NumberOption } from "./NumberOption.tsx";

export function Options() {
  return <div className="flex flex-col p-2 mb-2 border border-black">
    <h1 className="font-semibold">Tuner options</h1>
    <div className="flex flex-row flex-wrap gap-4 mb-2">
      <NumberOption name="referenceFreq" label="Reference frequency (A4 = Hz)" action={setReferenceFreq} />
      <NumberOption name="minNote" label="Minimum note" action={setMinNote} />
      <NumberOption name="maxNote" label="Maximum note" action={setMaxNote} />
    </div>

    <h1 className="font-semibold">Detection options</h1>
    <div className="flex flex-row flex-wrap gap-4 mb-2">
      <NumberOption name="cutoff" label="Cutoff" action={setCutoff} />
      <NumberOption name="probThres" label="Probability threshold" action={setProbThres} />
      <NumberOption name="timeoutMs" label="Timeout (ms)" action={setTimeoutMs} />
      <NumberOption name="lockInMs" label="Lock-in (ms)" action={setLockInMs} />
    </div>

    <h1 className="font-semibold">Audio options</h1>
    <div className="flex flex-row flex-wrap gap-4">
      <NumberOption name="sampleRate" label="Sample rate (Hz)" action={setSampleRate} />
      <NumberOption name="fftSize" label="FFT size" action={setFftSize} />
      <NumberOption name="minFreq" label="Minimum frequency (Hz)" action={setMinFreq} />
      <NumberOption name="maxFreq" label="Maximum frequency (Hz)" action={setMaxFreq} />
      <NumberOption name="lpf" label="Low-pass filter (Hz)" action={setLpf} />
    </div>
  </div>;
}
