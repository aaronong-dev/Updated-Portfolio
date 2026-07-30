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
  const threadRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [openedAt, setOpenedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;

    setOpenedAt(Date.now());
    setHoneypot("");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeMessageModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
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
  }

  function handleClose() {
    closeMessageModal();
    window.setTimeout(resetConversation, 220);
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
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        className={styles.window}
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
                />
                <span
                  className={`${styles.traffic} ${styles.trafficMinimize}`}
                  aria-hidden="true"
                />
                <span
                  className={`${styles.traffic} ${styles.trafficZoom}`}
                  aria-hidden="true"
                />
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
