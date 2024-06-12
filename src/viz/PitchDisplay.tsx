import { RefObject, useRef } from "react";
import { useCanvasSize } from "../utils.ts";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
}

const defaultWidth = 160;
const defaultHeight = 120;

export function PitchDisplay({ canvasRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, h] = useCanvasSize(canvasRef, defaultWidth, defaultHeight, containerRef);

  return <div className="w-full relative" style={{ height: defaultHeight }} ref={containerRef}>
    <canvas ref={canvasRef} width={w} height={h} className="w-full h-full inset" />
  </div>;
}
