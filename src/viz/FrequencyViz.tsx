import { RefObject } from "react";
import { useCanvasSize } from "../utils.ts";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
}

const defaultWidth = 640;
const defaultHeight = 200;

export function FrequencyViz({ canvasRef }: Props) {
  const [w, h] = useCanvasSize(canvasRef, defaultWidth, defaultHeight);

  return <div className="w-full mt-2 relative" style={{ height: defaultHeight }}>
    <canvas ref={canvasRef} width={w} height={h} className="w-full h-full inset" />
  </div>;
}
