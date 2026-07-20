"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import GridBackground, {
  type GridBackgroundHandle,
} from "./GridBackground";
import styles from "./Hero.module.css";

const FRICTION = 0.92;
const MIN_VELOCITY = 0.08;
const MAX_PAN = 1400;

const POLAROIDS = [
  {
    id: "one",
    className: "polaroidOne",
    label: "Polaroid 1",
    type: "image",
    src: "/polaroid-pictures/Polaroid-1.jpg",
  },
  {
    id: "two",
    className: "polaroidTwo",
    label: "Polaroid 2",
    type: "image",
    src: "/polaroid-pictures/Polaroid-2.JPG",
  },
  {
    id: "three",
    className: "polaroidThree",
    label: "Polaroid 3",
    type: "video",
    src: "/polaroid-pictures/polaroid-video/polaroid-video.MOV",
  },
  {
    id: "four",
    className: "polaroidFour",
    label: "Polaroid 4",
    type: "image",
    src: "/polaroid-pictures/Polraoid-3.JPG",
  },
  {
    id: "five",
    className: "polaroidFive",
    label: "Polaroid 5",
    type: "image",
    src: "/polaroid-pictures/Polaroid-4.JPG",
  },
] as const;

type PolaroidId = (typeof POLAROIDS)[number]["id"];

type CanvasDragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
  lastTime: number;
};

type PolaroidDragState = {
  id: PolaroidId;
  pointerId: number;
  lastX: number;
  lastY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function emptyOffsets(): Record<
  PolaroidId,
  { x: number; y: number; rot: number }
> {
  return {
    one: { x: 0, y: 0, rot: 0 },
    two: { x: 0, y: 0, rot: 0 },
    three: { x: 0, y: 0, rot: 0 },
    four: { x: 0, y: 0, rot: 0 },
    five: { x: 0, y: 0, rot: 0 },
  };
}

export default function Hero() {
  const gridRef = useRef<GridBackgroundHandle>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const textureRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const canvasDragRef = useRef<CanvasDragState | null>(null);
  const polaroidDragRef = useRef<PolaroidDragState | null>(null);
  const polaroidOffsetsRef = useRef(emptyOffsets());
  const polaroidNodesRef = useRef<Partial<Record<PolaroidId, HTMLElement>>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zCounterRef = useRef(5);
  const rafRef = useRef<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingPolaroid, setDraggingPolaroid] = useState<PolaroidId | null>(
    null,
  );
  const [zOrders, setZOrders] = useState<Record<PolaroidId, number>>({
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  });

  const applyPan = (x: number, y: number) => {
    const next = {
      x: clamp(x, -MAX_PAN, MAX_PAN),
      y: clamp(y, -MAX_PAN, MAX_PAN),
    };
    panRef.current = next;
    gridRef.current?.setOffset(next.x, next.y);
    const transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
    if (worldRef.current) {
      worldRef.current.style.transform = transform;
    }
    if (textureRef.current) {
      textureRef.current.style.transform = transform;
    }
  };

  const stopInertia = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startInertia = () => {
    stopInertia();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      velocityRef.current = { x: 0, y: 0 };
      return;
    }

    const tick = () => {
      const velocity = velocityRef.current;
      velocity.x *= FRICTION;
      velocity.y *= FRICTION;

      if (
        Math.abs(velocity.x) < MIN_VELOCITY &&
        Math.abs(velocity.y) < MIN_VELOCITY
      ) {
        velocity.x = 0;
        velocity.y = 0;
        rafRef.current = null;
        return;
      }

      const prev = panRef.current;
      applyPan(prev.x + velocity.x, prev.y + velocity.y);
      const next = panRef.current;

      if (next.x === prev.x) velocity.x = 0;
      if (next.y === prev.y) velocity.y = 0;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => stopInertia(), []);

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if (polaroidDragRef.current) return;

    stopInertia();
    velocityRef.current = { x: 0, y: 0 };
    canvasDragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const onCanvasPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = canvasDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const now = performance.now();
    const dt = Math.max(now - drag.lastTime, 1);
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;

    applyPan(panRef.current.x + dx, panRef.current.y + dy);

    velocityRef.current = {
      x: (dx / dt) * 16,
      y: (dy / dt) * 16,
    };

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
  };

  const endCanvasDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = canvasDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    canvasDragRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    startInertia();
  };

  const onPolaroidPointerDown =
    (id: PolaroidId) => (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;

      event.stopPropagation();
      stopInertia();
      velocityRef.current = { x: 0, y: 0 };
      canvasDragRef.current = null;
      setIsPanning(false);

      polaroidDragRef.current = {
        id,
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingPolaroid(id);

      // Nudge orientation when the card is picked up
      const offset = polaroidOffsetsRef.current[id];
      const nudge = (Math.random() * 10 + 4) * (Math.random() < 0.5 ? -1 : 1);
      offset.rot = clamp(offset.rot + nudge, -28, 28);
      event.currentTarget.style.setProperty("--drag-rot", `${offset.rot}deg`);

      zCounterRef.current += 1;
      const nextZ = zCounterRef.current;
      setZOrders((orders) => ({ ...orders, [id]: nextZ }));
    };

  const onPolaroidPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = polaroidDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    const offset = polaroidOffsetsRef.current[drag.id];
    offset.x += dx;
    offset.y += dy;
    // Lean with horizontal movement while dragging
    offset.rot = clamp(offset.rot + dx * 0.14, -28, 28);

    const node = polaroidNodesRef.current[drag.id];
    if (node) {
      node.style.setProperty("--drag-x", `${offset.x}px`);
      node.style.setProperty("--drag-y", `${offset.y}px`);
      node.style.setProperty("--drag-rot", `${offset.rot}deg`);
    }

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const endPolaroidDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = polaroidDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    polaroidDragRef.current = null;
    setDraggingPolaroid(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const playPolaroidVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  };

  const pausePolaroidVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  };

  return (
    <section
      className={`${styles.hero} ${isPanning ? styles.dragging : ""}`}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={endCanvasDrag}
      onPointerCancel={endCanvasDrag}
    >
      <GridBackground ref={gridRef} />
      <div
        ref={textureRef}
        className={styles.texture}
        aria-hidden="true"
      />
      <div ref={worldRef} className={styles.world}>
        <div className={styles.stage}>
          <ul className={styles.polaroids}>
            {POLAROIDS.map((polaroid) => {
              const isDragging = draggingPolaroid === polaroid.id;
              const dragStyle = {
                "--drag-x": `${polaroidOffsetsRef.current[polaroid.id].x}px`,
                "--drag-y": `${polaroidOffsetsRef.current[polaroid.id].y}px`,
                "--drag-rot": `${polaroidOffsetsRef.current[polaroid.id].rot}deg`,
                zIndex: zOrders[polaroid.id],
              } as CSSProperties;

              const isVideo = polaroid.type === "video";

              return (
                <li
                  key={polaroid.id}
                  ref={(node) => {
                    if (node) {
                      polaroidNodesRef.current[polaroid.id] = node;
                    } else {
                      delete polaroidNodesRef.current[polaroid.id];
                    }
                  }}
                  className={`${styles.polaroid} ${styles[polaroid.className]} ${
                    isDragging ? styles.polaroidDragging : ""
                  }`}
                  style={dragStyle}
                  aria-label={polaroid.label}
                  onPointerDown={onPolaroidPointerDown(polaroid.id)}
                  onPointerMove={onPolaroidPointerMove}
                  onPointerUp={endPolaroidDrag}
                  onPointerCancel={endPolaroidDrag}
                  onPointerEnter={isVideo ? playPolaroidVideo : undefined}
                  onPointerLeave={isVideo ? pausePolaroidVideo : undefined}
                >
                  <div className={styles.polaroidFrame}>
                    <div className={styles.polaroidPhoto}>
                      {isVideo ? (
                        <video
                          ref={videoRef}
                          className={styles.polaroidMedia}
                          src={polaroid.src}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-hidden="true"
                        />
                      ) : (
                        <Image
                          className={styles.polaroidMedia}
                          src={polaroid.src}
                          alt=""
                          fill
                          sizes="(max-width: 720px) 28vw, 16vw"
                          draggable={false}
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={styles.title}>
            <h1 className={styles.name}>Aaron Ong</h1>
            <p className={styles.role}>Software Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
