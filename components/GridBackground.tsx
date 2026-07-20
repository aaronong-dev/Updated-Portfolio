"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import styles from "./GridBackground.module.css";

export const CELL_SIZE = 44;
const STROKE = "hsla(0, 0%, 100%, 0.32)";

export type GridBackgroundHandle = {
  setOffset: (x: number, y: number) => void;
};

type GridBackgroundProps = {
  className?: string;
};

const GridBackground = forwardRef<GridBackgroundHandle, GridBackgroundProps>(
  function GridBackground({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const sizeRef = useRef({ width: 0, height: 0 });
    const drawRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      setOffset(x: number, y: number) {
        offsetRef.current = { x, y };
        drawRef.current();
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw = () => {
        const { width, height } = sizeRef.current;
        if (width <= 0 || height <= 0) return;

        const { x: offsetX, y: offsetY } = offsetRef.current;
        const shiftX = ((offsetX % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
        const shiftY = ((offsetY % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = STROKE;
        ctx.lineWidth = 1.25;
        ctx.beginPath();

        const startX = shiftX - CELL_SIZE;
        const startY = shiftY - CELL_SIZE;
        const endX = width + CELL_SIZE;
        const endY = height + CELL_SIZE;

        for (let x = startX; x <= endX; x += CELL_SIZE) {
          ctx.moveTo(x, startY);
          ctx.lineTo(x, endY);
        }

        for (let y = startY; y <= endY; y += CELL_SIZE) {
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
        }

        ctx.stroke();
      };

      drawRef.current = draw;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        sizeRef.current = { width, height };
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      };

      resize();

      const parent = canvas.parentElement;
      const resizeObserver = new ResizeObserver(resize);
      if (parent) resizeObserver.observe(parent);
      window.addEventListener("resize", resize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", resize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={className ? `${styles.grid} ${className}` : styles.grid}
        aria-hidden="true"
      />
    );
  },
);

export default GridBackground;
