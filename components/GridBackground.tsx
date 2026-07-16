"use client";

import { useEffect, useRef } from "react";
import styles from "./GridBackground.module.css";

const CELL_SIZE = 220 / 12;
const STROKE = "hsla(210, 18%, 22%, 0.55)";
const WARP_RADIUS = 160;
const WARP_STRENGTH = 28;
const POINTER_LERP = 0.18;
const STRENGTH_LERP = 0.12;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canHoverWarp() {
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    let strength = 0;
    let targetStrength = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let reduceMotion = prefersReducedMotion();
    let hoverEnabled = canHoverWarp();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const warpPoint = (x: number, y: number, amount: number) => {
      if (amount <= 0.001) return { x, y };

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= WARP_RADIUS || dist === 0) return { x, y };

      const t = 1 - dist / WARP_RADIUS;
      const falloff = t * t * (3 - 2 * t);
      const push = falloff * WARP_STRENGTH * amount;

      return {
        x: x + (dx / dist) * push,
        y: y + (dy / dist) * push,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = STROKE;
      ctx.lineWidth = 1;
      ctx.beginPath();

      const startX = -CELL_SIZE;
      const startY = -CELL_SIZE;
      const endX = width + CELL_SIZE;
      const endY = height + CELL_SIZE;
      const steps = 8;

      for (let x = startX; x <= endX; x += CELL_SIZE) {
        const prev = warpPoint(x, startY, strength);
        ctx.moveTo(prev.x, prev.y);

        for (let i = 1; i <= Math.ceil((endY - startY) / CELL_SIZE) * steps; i++) {
          const y = startY + (i * CELL_SIZE) / steps;
          if (y > endY) break;
          const next = warpPoint(x, y, strength);
          ctx.lineTo(next.x, next.y);
        }
      }

      for (let y = startY; y <= endY; y += CELL_SIZE) {
        const prev = warpPoint(startX, y, strength);
        ctx.moveTo(prev.x, prev.y);

        for (let i = 1; i <= Math.ceil((endX - startX) / CELL_SIZE) * steps; i++) {
          const x = startX + (i * CELL_SIZE) / steps;
          if (x > endX) break;
          const next = warpPoint(x, y, strength);
          ctx.lineTo(next.x, next.y);
        }
      }

      ctx.stroke();
    };

    const tick = () => {
      pointer.x += (pointer.targetX - pointer.x) * POINTER_LERP;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_LERP;
      strength += (targetStrength - strength) * STRENGTH_LERP;

      if (Math.abs(strength - targetStrength) < 0.001) {
        strength = targetStrength;
      }

      draw();
      frameId = window.requestAnimationFrame(tick);
    };

    const updatePointerFromEvent = (event: PointerEvent) => {
      if (!hoverEnabled || reduceMotion) return;

      const rect = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      pointer.active = true;
      targetStrength = 1;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      targetStrength = 0;
    };

    const handleMediaChange = () => {
      reduceMotion = prefersReducedMotion();
      hoverEnabled = canHoverWarp();

      if (reduceMotion || !hoverEnabled) {
        targetStrength = 0;
        strength = 0;
        pointer.active = false;
      }
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    resize();
    draw();
    frameId = window.requestAnimationFrame(tick);

    const parent = canvas.parentElement;
    const resizeObserver = new ResizeObserver(resize);
    if (parent) resizeObserver.observe(parent);

    // Hero children above this layer use pointer-events: none, so the canvas
    // can capture hover across the full hero while staying visually behind.
    canvas.addEventListener("pointermove", updatePointerFromEvent);
    canvas.addEventListener("pointerenter", updatePointerFromEvent);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    motionQuery.addEventListener("change", handleMediaChange);
    hoverQuery.addEventListener("change", handleMediaChange);
    pointerQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", updatePointerFromEvent);
      canvas.removeEventListener("pointerenter", updatePointerFromEvent);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", handleMediaChange);
      hoverQuery.removeEventListener("change", handleMediaChange);
      pointerQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.grid}
      aria-hidden="true"
    />
  );
}
