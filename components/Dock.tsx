"use client";

import { Move } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./Dock.module.css";

const DOCK_ITEMS = [
  {
    label: "Home",
    src: "/docker-icons/Home-Button.png",
    href: "/#home",
  },
  {
    label: "Profile",
    src: "/docker-icons/Profile-Icon.png",
    href: "/#profile",
  },
  {
    label: "Projects",
    src: "/docker-icons/Folder-Icon.png",
    href: "/#projects",
  },
  {
    label: "LinkedIn",
    src: "/docker-icons/Linked-In-Icon.png",
    href: "https://www.linkedin.com/in/aaron-ong-77b642158/",
    external: true,
  },
  {
    label: "GitHub",
    src: "/docker-icons/GitHub-Logo.png",
    href: "https://github.com/aaronong-dev",
    external: true,
  },
  {
    label: "Messages",
    src: "/Message-Icon.png",
  },
] as const;

type DockEdge = "top" | "bottom" | "left" | "right";

const STORAGE_KEY = "portfolio-dock-edge";
const EDGE_CHANGE_EVENT = "portfolio-dock-edge-change";
const EDGE_PADDING = 12;
const MIN_VISIBLE = 48;
const SIDE_ZONE = 140;
const DEFAULT_EDGE: DockEdge = "left";

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  clientX: number;
  clientY: number;
};

type SnapSnapshot = {
  dock: DOMRect;
  children: DOMRect[];
};

function isDockEdge(value: string | null): value is DockEdge {
  return value === "top" || value === "bottom" || value === "left" || value === "right";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDragBounds(width: number, height: number) {
  // Keep the short side fully visible. For a wide horizontal dock this still
  // allows overhang so the pointer can reach the left/right edges.
  const keepX = Math.min(width, Math.max(MIN_VISIBLE, Math.min(width, height)));
  const keepY = Math.min(height, Math.max(MIN_VISIBLE, Math.min(width, height)));

  return {
    minX: EDGE_PADDING - (width - keepX),
    maxX: window.innerWidth - EDGE_PADDING - keepX,
    minY: EDGE_PADDING - (height - keepY),
    maxY: window.innerHeight - EDGE_PADDING - keepY,
  };
}

function clampDragPosition(x: number, y: number, width: number, height: number) {
  const bounds = getDragBounds(width, height);
  return {
    x: clamp(x, bounds.minX, Math.max(bounds.minX, bounds.maxX)),
    y: clamp(y, bounds.minY, Math.max(bounds.minY, bounds.maxY)),
  };
}

function getNearestEdge(pointX: number, pointY: number): DockEdge {
  // Prefer left/right when the pointer enters a side zone so a top dock can
  // reach the sides without staying locked to the top edge.
  if (pointX <= SIDE_ZONE) {
    return "left";
  }
  if (pointX >= window.innerWidth - SIDE_ZONE) {
    return "right";
  }

  const distances: Record<DockEdge, number> = {
    top: pointY,
    bottom: window.innerHeight - pointY,
    left: pointX,
    right: window.innerWidth - pointX,
  };

  return (Object.entries(distances) as [DockEdge, number][]).reduce((nearest, current) =>
    current[1] < nearest[1] ? current : nearest,
  )[0];
}

function readStoredEdge(): DockEdge {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isDockEdge(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors.
  }

  return DEFAULT_EDGE;
}

function subscribeToEdge(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(EDGE_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(EDGE_CHANGE_EVENT, handleChange);
  };
}

function cancelAnimations(element: HTMLElement) {
  element.getAnimations().forEach((animation) => {
    animation.cancel();
  });
}

function cancelDockAnimations(dock: HTMLElement) {
  cancelAnimations(dock);
  dock.querySelectorAll<HTMLElement>("[data-dock-animated]").forEach(cancelAnimations);
}

function readAnimatedRects(dock: HTMLElement): SnapSnapshot {
  return {
    dock: dock.getBoundingClientRect(),
    children: Array.from(
      dock.querySelectorAll<HTMLElement>("[data-dock-animated]"),
      (child) => child.getBoundingClientRect(),
    ),
  };
}

function persistEdge(nextEdge: DockEdge) {
  try {
    window.localStorage.setItem(STORAGE_KEY, nextEdge);
  } catch {
    // Ignore storage access errors.
  }

  window.dispatchEvent(new Event(EDGE_CHANGE_EVENT));
}

export default function Dock() {
  const dockRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const snapSnapshotRef = useRef<SnapSnapshot | null>(null);
  const previewEdgeRef = useRef<DockEdge>(DEFAULT_EDGE);
  const flipCleanupRef = useRef<(() => void) | null>(null);

  const edge = useSyncExternalStore(subscribeToEdge, readStoredEdge, () => DEFAULT_EDGE);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [previewEdge, setPreviewEdge] = useState<DockEdge>(DEFAULT_EDGE);
  const displayedEdge = isDragging ? previewEdge : edge;

  const settleFlip = useCallback(() => {
    flipCleanupRef.current?.();
    flipCleanupRef.current = null;

    const dock = dockRef.current;
    if (dock) {
      cancelDockAnimations(dock);
    }
  }, []);

  const captureSnapSnapshot = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) {
      return;
    }

    // Finish any in-flight FLIP so fast edge changes measure real layout, not mid-tween frames.
    settleFlip();
    void dock.offsetWidth;
    snapSnapshotRef.current = readAnimatedRects(dock);
  }, [settleFlip]);

  const refreshDragSize = useCallback(() => {
    const drag = dragRef.current;
    const dock = dockRef.current;
    if (!drag || !dock) {
      return;
    }

    // Read layout size before FLIP animations start so bounds use the target orientation.
    drag.width = dock.offsetWidth;
    drag.height = dock.offsetHeight;
    drag.offsetX = clamp(drag.offsetX, 0, Math.max(0, drag.width));
    drag.offsetY = clamp(drag.offsetY, 0, Math.max(0, drag.height));
  }, []);

  const updateDragPosition = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      drag.clientX = clientX;
      drag.clientY = clientY;

      const nextPosition = clampDragPosition(
        clientX - drag.offsetX,
        clientY - drag.offsetY,
        drag.width,
        drag.height,
      );
      const nextPreviewEdge = getNearestEdge(clientX, clientY);

      setDragPosition(nextPosition);

      if (nextPreviewEdge !== previewEdgeRef.current) {
        captureSnapSnapshot();
        previewEdgeRef.current = nextPreviewEdge;
        setPreviewEdge(nextPreviewEdge);
      }
    },
    [captureSnapSnapshot],
  );

  useLayoutEffect(() => {
    const snapshot = snapSnapshotRef.current;
    const dock = dockRef.current;
    if (!snapshot || !dock) {
      return;
    }

    snapSnapshotRef.current = null;

    if (isDragging) {
      refreshDragSize();
      const drag = dragRef.current;
      if (drag) {
        const nextPosition = clampDragPosition(
          drag.clientX - drag.offsetX,
          drag.clientY - drag.offsetY,
          drag.width,
          drag.height,
        );
        // Apply immediately so FLIP measurements match the post-orientation drag position.
        dock.style.left = `${nextPosition.x}px`;
        dock.style.top = `${nextPosition.y}px`;
        dock.style.right = "auto";
        dock.style.bottom = "auto";
        dock.style.transform = "none";
        setDragPosition(nextPosition);
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    cancelDockAnimations(dock);

    const finalWidth = dock.offsetWidth;
    const finalHeight = dock.offsetHeight;
    const parentRect = dock.getBoundingClientRect();
    const originX = parentRect.left + dock.clientLeft;
    const originY = parentRect.top + dock.clientTop;
    const animatedChildren = Array.from(
      dock.querySelectorAll<HTMLElement>("[data-dock-animated]"),
    );
    const childMeta = animatedChildren.map((child, index) => ({
      child,
      previousRect: snapshot.children[index],
      finalRect: child.getBoundingClientRect(),
    }));

    const animationOptions: KeyframeAnimationOptions = {
      duration: 320,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "none",
    };

    // Lock the destination size, then pull children out of flow so tray resizing
    // and icon FLIP can run on the same timeline without flex reflow fighting them.
    dock.style.width = `${finalWidth}px`;
    dock.style.height = `${finalHeight}px`;

    childMeta.forEach(({ child, finalRect }) => {
      child.style.position = "absolute";
      child.style.left = `${finalRect.left - originX}px`;
      child.style.top = `${finalRect.top - originY}px`;
      child.style.width = `${finalRect.width}px`;
      child.style.height = `${finalRect.height}px`;
      child.style.margin = "0";
      child.style.zIndex = "1";
    });

    const cleanup = () => {
      dock.style.width = "";
      dock.style.height = "";
      childMeta.forEach(({ child }) => {
        child.style.position = "";
        child.style.left = "";
        child.style.top = "";
        child.style.width = "";
        child.style.height = "";
        child.style.margin = "";
        child.style.zIndex = "";
      });
    };

    flipCleanupRef.current = cleanup;

    const finishFlip = () => {
      if (flipCleanupRef.current === cleanup) {
        cleanup();
        flipCleanupRef.current = null;
      }
    };

    const animations: Animation[] = [
      dock.animate(
        [
          {
            width: `${snapshot.dock.width}px`,
            height: `${snapshot.dock.height}px`,
          },
          {
            width: `${finalWidth}px`,
            height: `${finalHeight}px`,
          },
        ],
        animationOptions,
      ),
    ];

    childMeta.forEach(({ child, previousRect, finalRect }) => {
      if (!previousRect) {
        return;
      }

      const deltaX = previousRect.left - finalRect.left;
      const deltaY = previousRect.top - finalRect.top;
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return;
      }

      animations.push(
        child.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" },
          ],
          animationOptions,
        ),
      );
    });

    if (!isDragging) {
      const finalDockRect = dock.getBoundingClientRect();
      const deltaX = snapshot.dock.left - finalDockRect.left;
      const deltaY = snapshot.dock.top - finalDockRect.top;
      if (Math.abs(deltaX) >= 0.5 || Math.abs(deltaY) >= 0.5) {
        const computedTransform = window.getComputedStyle(dock).transform;
        const finalTransform = computedTransform === "none" ? "none" : computedTransform;
        const fromTransform =
          `translate(${deltaX}px, ${deltaY}px)` +
          (finalTransform === "none" ? "" : ` ${finalTransform}`);

        animations.push(
          dock.animate(
            [{ transform: fromTransform }, { transform: finalTransform }],
            animationOptions,
          ),
        );
      }
    }

    const timeoutId = window.setTimeout(finishFlip, animationOptions.duration + 64);
    void Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(
      () => {
        window.clearTimeout(timeoutId);
        finishFlip();
      },
    );

    return () => {
      window.clearTimeout(timeoutId);
      settleFlip();
    };
  }, [displayedEdge, isDragging, refreshDragSize, settleFlip]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    const dock = dockRef.current;
    if (!dock) {
      return;
    }

    const rect = dock.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: dock.offsetWidth,
      height: dock.offsetHeight,
      clientX: event.clientX,
      clientY: event.clientY,
    };

    previewEdgeRef.current = edge;
    setPreviewEdge(edge);
    setIsDragging(true);
    setDragPosition({ x: rect.left, y: rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    updateDragPosition(event.clientX, event.clientY);
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    captureSnapSnapshot();

    dragRef.current = null;
    setIsDragging(false);
    setDragPosition(null);
    persistEdge(previewEdgeRef.current);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const isVertical = displayedEdge === "left" || displayedEdge === "right";
  const edgeClassName = {
    top: styles.edgeTop,
    bottom: styles.edgeBottom,
    left: styles.edgeLeft,
    right: styles.edgeRight,
  }[displayedEdge];

  const dockClassName = [
    styles.dock,
    edgeClassName,
    isVertical ? styles.vertical : styles.horizontal,
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dragStyle: CSSProperties | undefined =
    isDragging && dragPosition
      ? {
          left: dragPosition.x,
          top: dragPosition.y,
          right: "auto",
          bottom: "auto",
          transform: "none",
        }
      : undefined;

  return (
    <nav
      ref={dockRef}
      className={dockClassName}
      style={dragStyle}
      aria-label="Dock"
      data-edge={displayedEdge}
      data-dragging={isDragging ? "true" : "false"}
    >
      <button
        type="button"
        className={styles.moveHandle}
        data-dock-animated
        aria-label="Move dock"
        title="Move dock"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Move aria-hidden="true" className={styles.moveIcon} strokeWidth={2.25} />
      </button>

      <ul className={styles.tray}>
        {DOCK_ITEMS.map((item) => {
          const content = (
            <>
              <Image
                src={item.src}
                alt=""
                width={96}
                height={96}
                className={styles.icon}
                draggable={false}
              />
              <span className={styles.tooltip}>{item.label}</span>
            </>
          );

          return (
            <li key={item.label} className={styles.item} data-dock-animated>
              {"href" in item && item.href ? (
                <a
                  href={item.href}
                  className={styles.button}
                  aria-label={item.label}
                  {...("external" in item && item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {content}
                </a>
              ) : (
                <button type="button" className={styles.button} aria-label={item.label}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
