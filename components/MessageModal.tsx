"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useMessageModal } from "./MessageModalProvider";
import styles from "./MessageModal.module.css";

type DeliveryStatus = "none" | "delivered" | "sending" | "failed";

type ChatMessage = {
  id: string;
  text: string;
  time: string;
  status: DeliveryStatus;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: DeliveryStatus) {
  if (status === "none") return null;
  if (status === "sending") return "Sending…";
  if (status === "failed") return "Not Delivered";
  return "Delivered";
}

export default function MessageModal() {
  const { isOpen, closeMessageModal } = useMessageModal();
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const minimizingRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    minimizingRef.current = false;
    setIsMinimizing(false);
    setIsExpanded(false);
    setOpenedAt(Date.now());
    setHoneypot("");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
    // handleClose is stable enough via closeMessageModal; avoid re-binding loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, closeMessageModal]);

  useEffect(() => {
    if (!isOpen) return;
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
  }, [isOpen, messages]);

  function resetConversation() {
    setMessages([]);
    setDraft("");
    setSubmitting(false);
    setHoneypot("");
    setOpenedAt(Date.now());
    setIsMinimizing(false);
    setIsExpanded(false);
    minimizingRef.current = false;
  }

  function handleClose() {
    if (minimizingRef.current) return;
    closeMessageModal();
    window.setTimeout(resetConversation, 220);
  }

  function handleExpand() {
    if (minimizingRef.current) return;
    setIsExpanded((current) => !current);
  }

  function getDockMessagesTarget() {
    return (
      document.querySelector<HTMLElement>('[aria-label="Dock"] [aria-label="Messages"]') ??
      document.querySelector<HTMLElement>('[aria-label="Dock"]')
    );
  }

  function handleMinimize() {
    if (minimizingRef.current) return;

    const panel = windowRef.current;
    const backdrop = backdropRef.current;
    if (!panel) {
      handleClose();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      handleClose();
      return;
    }

    minimizingRef.current = true;
    setIsMinimizing(true);

    const from = panel.getBoundingClientRect();
    const target = getDockMessagesTarget();
    const fallback = {
      left: 16,
      top: window.innerHeight / 2 - 24,
      width: 48,
      height: 48,
    };
    const to = target?.getBoundingClientRect() ?? fallback;

    const fromX = from.left + from.width / 2;
    const fromY = from.top + from.height / 2;
    const toX = to.left + to.width / 2;
    const toY = to.top + to.height / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const scale = Math.max(0.04, Math.min(to.width / from.width, to.height / from.height) * 0.9);

    const easing = "cubic-bezier(0.4, 0.0, 0.2, 1)";
    const duration = 520;

    panel.style.transformOrigin = "center center";

    const panelAnimation = panel.animate(
      [
        {
          transform: "translate(0px, 0px) scale(1)",
          opacity: 1,
          borderRadius: "0.85rem",
          filter: "blur(0px)",
        },
        {
          transform: `translate(${dx * 0.55}px, ${dy * 0.35}px) scale(${Math.max(scale * 2.4, 0.18)})`,
          opacity: 0.92,
          borderRadius: "1.1rem",
          filter: "blur(0px)",
          offset: 0.55,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: 0,
          borderRadius: "22%",
          filter: "blur(1.5px)",
        },
      ],
      { duration, easing, fill: "forwards" },
    );

    backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration * 0.85,
      easing,
      fill: "forwards",
    });

    void panelAnimation.finished
      .catch(() => undefined)
      .then(() => {
        if (target) {
          target.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(1.22)" },
              { transform: "scale(1)" },
            ],
            {
              duration: 340,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
          );
        }

        minimizingRef.current = false;
        setIsMinimizing(false);
        closeMessageModal();
      });
  }

  function updateMessageStatus(id: string, status: DeliveryStatus) {
    setMessages((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
    );
  }

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
    if (submitting) return;

    const text = draft.trim().slice(0, 2000);
    if (!text) return;

    const messageId = createId();
    const next: ChatMessage = {
      id: messageId,
      text,
      time: formatTimestamp(),
      status: "sending",
    };

    setMessages((current) => [...current, next]);
    setDraft("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          website: honeypot,
          openedAt,
        }),
      });

      if (!response.ok) {
        throw new Error("send failed");
      }

      updateMessageStatus(messageId, "delivered");
    } catch {
      updateMessageStatus(messageId, "failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  if (!isOpen) return null;

  const canSend = draft.trim().length > 0 && !submitting;

  return (
    <div
      ref={backdropRef}
      className={[
        styles.backdrop,
        isMinimizing ? styles.minimizing : "",
        isExpanded ? styles.backdropExpanded : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isMinimizing ? undefined : handleClose}
    >
      <div
        ref={windowRef}
        className={[styles.window, isExpanded ? styles.windowExpanded : ""]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.sidebarPane}>
          <aside className={styles.sidebar} aria-label="Conversations">
            <div className={styles.sidebarTop}>
              <div className={styles.trafficLights}>
                <button
                  type="button"
                  className={`${styles.traffic} ${styles.trafficClose}`}
                  onClick={handleClose}
                  aria-label="Close messages"
                  title="Close"
                >
                  <svg viewBox="0 0 12 12" className={styles.trafficIcon} aria-hidden="true" focusable="false">
                    <path
                      d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.traffic} ${styles.trafficMinimize}`}
                  onClick={handleMinimize}
                  aria-label="Minimize messages"
                  title="Minimize"
                  disabled={isMinimizing}
                >
                  <svg viewBox="0 0 12 12" className={styles.trafficIcon} aria-hidden="true" focusable="false">
                    <path
                      d="M2.5 6h7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.traffic} ${styles.trafficZoom}`}
                  onClick={handleExpand}
                  aria-label={isExpanded ? "Exit full screen" : "Enter full screen"}
                  title={isExpanded ? "Exit Full Screen" : "Full Screen"}
                  disabled={isMinimizing}
                >
                  {isExpanded ? (
                    <svg viewBox="0 0 12 12" className={styles.trafficIcon} aria-hidden="true" focusable="false">
                      <path
                        d="M7.2 2.8H9.2V4.8M4.8 9.2H2.8V7.2M9.2 2.8 6.8 5.2M2.8 9.2l2.4-2.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 12 12" className={styles.trafficIcon} aria-hidden="true" focusable="false">
                      <path
                        d="M4.2 7.8H2.8V6.4M7.8 4.2h1.4V5.6M2.8 7.8l2.2-2.2M9.2 4.2 7 6.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <span className={styles.sidebarMenu} aria-hidden="true">
                <svg viewBox="0 0 16 16" focusable="false">
                  <path
                    d="M2.5 4h11M2.5 8h11M2.5 12h11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>

            <div className={styles.search} aria-hidden="true">
              <svg viewBox="0 0 16 16" className={styles.searchIcon} focusable="false">
                <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="m10.2 10.2 3 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <span>Search</span>
            </div>

            <button type="button" className={styles.conversation} aria-current="true">
              <Image
                src="/Personal-Profile.png"
                alt=""
                width={96}
                height={96}
                className={styles.conversationAvatar}
                draggable={false}
              />
              <span className={styles.conversationBody}>
                <span className={styles.conversationTop}>
                  <span id={titleId} className={styles.conversationName}>
                    New Message to Aaron Ong
                  </span>
                  <span className={styles.conversationTime}>Now</span>
                </span>
              </span>
            </button>
          </aside>
        </div>

        <section className={styles.chat} aria-label="Chat with Aaron Ong">
          <header className={styles.chatHeader}>
            <div className={styles.toPane}>
              <Image
                src="/Personal-Profile.png"
                alt=""
                width={96}
                height={96}
                className={styles.chatAvatar}
                draggable={false}
              />
              <span className={styles.chatName}>Aaron</span>
              <button
                type="button"
                className={styles.headerClose}
                onClick={handleClose}
                aria-label="Close messages"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                  <path
                    d="M2 2l10 10M12 2 2 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </header>

          <ul className={styles.thread} ref={threadRef} aria-live="polite">
            {messages.map((entry, index) => (
              <li
                key={entry.id}
                className={`${styles.bubbleRow} ${styles.bubbleRowVisitor}`}
              >
                <div className={styles.visitorStack}>
                  {index === 0 ? (
                    <time className={styles.messageTime} dateTime={entry.time}>
                      Today {entry.time}
                    </time>
                  ) : null}
                  <div className={`${styles.bubble} ${styles.bubbleVisitor}`}>
                    {entry.text}
                  </div>
                  {index === messages.length - 1 && statusLabel(entry.status) ? (
                    <span
                      className={
                        entry.status === "failed"
                          ? `${styles.deliveryStatus} ${styles.deliveryFailed}`
                          : styles.deliveryStatus
                      }
                    >
                      {statusLabel(entry.status)}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <form className={styles.composer} onSubmit={(event) => void handleSend(event)}>
            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
            <span className={styles.composerPlus} aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path
                  d="M8 3.25v9.5M3.25 8h9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className={styles.inputShell}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Message"
                rows={1}
                disabled={submitting}
                aria-label="Message"
                autoComplete="off"
              />
              <button
                type="submit"
                className={styles.send}
                disabled={!canSend}
                aria-label="Send message"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M2.2 8.1 13.4 2.7c.45-.22.9.24.67.68L8.8 13.7a.55.55 0 0 1-1.02-.05L6.4 9.4 2.25 8.05a.45.45 0 0 1-.05-.95Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
