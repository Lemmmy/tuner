import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AudioShenanigans } from "./audio.ts";
import { clearLockedInDetections } from "./state/audioSlice.ts";
import { FrequencyViz } from "./viz/FrequencyViz.tsx";
import { PitchDisplay } from "./viz/PitchDisplay.tsx";
import { RootState } from "./state/store.ts";
import { ResultsTable } from "./viz/ResultsTable.tsx";

function onError(e: any) {
  console.error(e);
  alert("An error occurred. Check the console for more information.");
}

export function Tuner() {
  const audio = useRef<AudioShenanigans | null>(null);

  const dispatch   = useDispatch();
  const sampleRate = useSelector((s: RootState) => s.options.sampleRate);
  const cutoff     = useSelector((s: RootState) => s.options.cutoff);
  const fftSize    = useSelector((s: RootState) => s.options.fftSize);
  const running    = useSelector((s: RootState) => s.audio.running);

  const freqCanvas = useRef<HTMLCanvasElement>(null);
  const freqVizCanvas = useRef<HTMLCanvasElement>(null);

  const start = useCallback(() => { audio.current?.start().catch(onError); }, []);
  const stop = useCallback(() => { audio.current?.stop(); }, []);

  // Create the audio context, and close it when the component unmount
  useEffect(() => {
    audio.current = new AudioShenanigans(freqCanvas, freqVizCanvas, sampleRate, cutoff, fftSize);
    return () => { audio.current?.stop(); };
  }, [sampleRate, cutoff, fftSize]);

  // Try to auto-start
  useEffect(() => { audio.current?.start().catch(onError); }, []);

  return <div className="flex flex-col gap-2">
    <FrequencyViz canvasRef={freqVizCanvas} />

    {/* Main two-col layout */}
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-2">
      {/* Left sidebar: controls and pitch display */}
      <div className="col-span-3 flex flex-col gap-2">
        {/* Button row */}
        <div className="flex gap-2">
          {/* Stop/start button */}
          <button
            onClick={running ? stop : start}
            className={clsx("flex-1 text-white px-2 py-1", running ? "bg-pink-700" : "bg-pink-500")}
          >
            {running ? "Stop" : "Start"}
          </button>

          {/* Clear results button */}
          <button
            onClick={() => dispatch(clearLockedInDetections())}
            className="flex-1 bg-gray-400 text-black px-2 py-1"
          >
            Clear results
          </button>
        </div>

        {/* Pitch display */}
        <PitchDisplay canvasRef={freqCanvas} />
      </div>

      {/* Right sidebar: results table */}
      <div className="col-span-5">
        <ResultsTable />
      </div>
    </div>
  </div>;
}
