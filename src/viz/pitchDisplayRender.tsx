import { scaleLinear } from "d3-scale";
import memoizee from "memoizee";
import { RefObject } from "react";
import { midiNoteToCents, midiNoteToNameAndCents } from "../midi.ts";
import { Detection } from "../state/audioSlice.ts";

const memoLinear = memoizee((width: number) =>
  scaleLinear().domain([-50, 50]).range([0, width]));

export function renderPitchDisplay(
  { current: canvas }: RefObject<HTMLCanvasElement>,
  pendingLockInDetections: Detection[] | null,
  lastDetection: Detection | null
) {
  if (!canvas) return;
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Ensure the inner region's width is a multiple of 50
  const innerWidth = Math.floor(width / 50) * 50;
  const innerHeight = height - 48;
  const innerX = Math.floor((width - innerWidth) / 2);
  const scale = memoLinear(innerWidth);

  ctx.clearRect(0, 0, width, height);

  // 0.5px offset to prevent blurred lines
  ctx.translate(0.5, 0.5);
  ctx.imageSmoothingEnabled = false;

  // Gauge border + ticks
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(innerX, 0, innerWidth, innerHeight);

  // One tick for each cent between -50 and 50. Multiples of 10, and zero, should be bigger
  const needleHeight = Math.floor(innerHeight * 0.75);
  const biggestTickHeight = Math.floor(innerHeight / 2);
  const bigTickHeight = Math.floor(biggestTickHeight * 0.85);
  const smallTickHeight = Math.floor(biggestTickHeight * 0.5);

  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";

  for (let i = -50; i <= 50; i++) {
    const x = Math.floor(innerX + scale(i));
    const h = i === 0 ? biggestTickHeight : (i % 10 === 0 ? bigTickHeight : smallTickHeight);
    ctx.beginPath();
    ctx.moveTo(x, innerHeight);
    ctx.lineTo(x, innerHeight - h);
    ctx.stroke();

    // Text labels for multiples of 10
    if (i % 10 === 0 && i !== 0 && i !== 50 && i !== -50) {
      ctx.fillText(i.toString(), x, innerHeight - h - 4);
    }
  }

  ctx.translate(-0.5, -0.5);

  // Draw the pending lock-in detections as transparent blue lines
  if (pendingLockInDetections) {
    ctx.strokeStyle = "#1188aa";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const detection of pendingLockInDetections) {
      const x = Math.floor(innerX + scale(midiNoteToCents(detection.midiNote)));
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Draw the last detection as a thick red line
  if (lastDetection) {
    const [noteName, octave, cents] = midiNoteToNameAndCents(lastDetection.midiNote);

    const x = Math.floor(innerX + scale(cents));
    ctx.fillStyle = "#cc1111";
    ctx.fillRect(x - 2, innerHeight - needleHeight, 5, needleHeight);

    // Draw the current note name centered, cents smaller below it, and the frequency in the bottom right
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(noteName + octave, width / 2, innerHeight + 24);

    const sign = cents >= 0 ? "+" : "";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`${sign}${cents.toFixed(1)} cents`, width / 2, innerHeight + 40);

    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${lastDetection.freq.toFixed(1)} Hz`, innerX + innerWidth - 1, innerHeight + 16);
  }
}
