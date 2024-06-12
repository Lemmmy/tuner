import { ScaleContinuousNumeric, scaleLinear, scaleLog } from "d3-scale";
import memoizee from "memoizee";
import { RefObject } from "react";
import { midiNoteToFreq, midiNoteToName } from "../midi.ts";
import { Detection } from "../state/audioSlice.ts";
import { OptionsState } from "../state/optionsSlice.ts";

const memoLinear = memoizee((width: number, bufSize: number, min: number) =>
  scaleLinear().domain([min, bufSize]).range([0, width]));
const memoLog = memoizee((width: number, bufSize: number, min: number) =>
  scaleLog().domain([min, bufSize]).range([0, width]));

function drawHzText(
  ctx: CanvasRenderingContext2D,
  x: number | null,
  hz: number | null,
  y: number,
  sampScale: ScaleContinuousNumeric<number, number>,
  hzScale: ScaleContinuousNumeric<number, number>,
  align: CanvasTextAlign,
  suffix = ""
) {
  ctx.textAlign = align;

  if (x === null && hz !== null) {
    const smp = hzScale.invert(hz);
    x = sampScale(smp);
  } else if (x !== null) {
    const smp = sampScale.invert(x);
    hz = hzScale(smp);
  } else {
    return;
  }

  ctx.fillText(`${hz.toFixed(0)} Hz${suffix}`, x, y);

  ctx.textAlign = "center";
}

let lastBufLength = 0;

export function renderFreqCanvas(
  { current: canvas }: RefObject<HTMLCanvasElement>,
  sampleRate: number,
  { referenceFreq, minFreq, minNote, maxNote }: Pick<OptionsState, "referenceFreq" | "minFreq" | "minNote" | "maxNote">,
  lastDetection: Detection | null,
  buf: Uint8Array | null
) {
  if (!canvas) return;
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  lastBufLength = buf ? buf.length : lastBufLength;
  const hzScale = memoLinear(sampleRate / 2, lastBufLength, 1);
  // Derive the minimum for the sample scale by inverting the hz scale
  const sampScale = memoLog(width, lastBufLength, hzScale.invert(minFreq));

  const vizHeight = height - 32;
  const textY = vizHeight + 14;

  ctx.clearRect(0, 0, width, height);

  // Frequency labels
  ctx.fillStyle = "#000000";
  ctx.font = "12px sans-serif";

  ctx.textAlign = "left";
  drawHzText(ctx, 0, null, textY, sampScale, hzScale, "left");

  ctx.textAlign = "center";
  drawHzText(ctx, null, referenceFreq, textY, sampScale, hzScale, "center", " (A4)");
  drawHzText(ctx, null, midiNoteToFreq(minNote, referenceFreq), textY, sampScale, hzScale, "center",
    ` (${midiNoteToName(minNote)})`);
  drawHzText(ctx, null, midiNoteToFreq(maxNote, referenceFreq), textY, sampScale, hzScale, "center",
    ` (${midiNoteToName(maxNote)})`);

  ctx.textAlign = "right";
  drawHzText(ctx, width, null, textY, sampScale, hzScale, "right");

  // Frequency viz
  if (buf != null) {
    ctx.strokeStyle = "#ff66aa";
    ctx.fillStyle = "rgba(255,102,170,0.33)";
    ctx.beginPath();
    ctx.moveTo(0, vizHeight);

    for (let i = 0; i < buf.length; i++) {
      const x = sampScale(i);
      const y = (1 - buf[i] / 255) * vizHeight;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, vizHeight);

    ctx.fill();
    ctx.stroke();
  }

  // Bar for the last detection
  if (lastDetection) {
    // The actual detection
    ctx.fillStyle = "#aadd00";
    ctx.fillRect(Math.floor(sampScale(hzScale.invert(lastDetection.freq))), 0, 2, vizHeight + 16);
    ctx.fillStyle = "#668800";
    drawHzText(ctx, null, lastDetection.freq, textY + 14, sampScale, hzScale, "center");
  }
}
