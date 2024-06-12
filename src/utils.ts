import useResizeObserver from "@react-hook/resize-observer";
import { RefObject, useEffect, useLayoutEffect, useState } from "react";

export function useSize(target: RefObject<HTMLElement>): DOMRect | undefined {
  const [size, setSize] = useState<DOMRect>();

  useLayoutEffect(() => {
    const el = target.current;
    if (!el) return;
    setSize(el.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, e => setSize(e.contentRect));

  return size;
}

export function useCanvasSize(
  target: RefObject<HTMLCanvasElement>,
  defaultWidth: number,
  defaultHeight: number,
  sizeTarget: RefObject<HTMLElement> = target
): [number, number] {
  const dpr = window.devicePixelRatio || 1;
  const size = useSize(sizeTarget);

  useEffect(() => {
    const canvas = target.current;
    if (!canvas) return;

    canvas.width = Math.floor((size?.width ?? defaultWidth) * dpr);
    canvas.height = Math.floor(defaultHeight * dpr);

    const currentSizeTarget = sizeTarget.current;
    if (currentSizeTarget !== canvas) {
      canvas.style.width = `${size?.width ?? defaultWidth}px`;
      canvas.style.height = `${defaultHeight}px`;
    }
  }, [target, size?.width, dpr, defaultWidth, defaultHeight, sizeTarget]);

  return [size?.width ?? defaultWidth, defaultHeight];
}

export const lsKey = (key: string) => `tuner:${key}`;
export const lsGet = (key: string, def: string) => localStorage.getItem(lsKey(key)) ?? def;
export const lsSet = (key: string, val: string) => localStorage.setItem(lsKey(key), val);

export const lsGetNumber = (key: string, def: number) => {
  const val = localStorage.getItem(lsKey(key));
  return val ? parseFloat(val) : def;
}

export const lsSetNumber = (key: string, val: number) => localStorage
  .setItem(lsKey(key), val.toString());
