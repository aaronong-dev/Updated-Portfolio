"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./Profile.module.css";

const STICKERS = [
  {
    src: "/collage-stickers/Ultrawide.png",
    alt: "Ultrawide monitor",
    width: 1537,
    height: 1023,
    className: styles.stickerUltrawide,
  },
  {
    src: "/collage-stickers/Macbook.png",
    alt: "MacBook",
    width: 1537,
    height: 1023,
    className: styles.stickerMacbook,
  },
  {
    src: "/collage-stickers/IPad-Tablet.png",
    alt: "iPad",
    width: 1013,
    height: 1552,
    className: styles.stickerIpad,
  },
  {
    src: "/collage-stickers/Headphones.png",
    alt: "Headphones",
    width: 1013,
    height: 1552,
    className: styles.stickerHeadphones,
  },
  {
    src: "/collage-stickers/Mini-Keyboard.png",
    alt: "Mini keyboard",
    width: 1537,
    height: 1023,
    className: styles.stickerKeyboard,
  },
] as const;

const CLIENTS = [
  {
    src: "/Client1.png",
    alt: "Client project 1",
    width: 2248,
    height: 1220,
  },
  {
    src: "/Client2.png",
    alt: "Client project 2",
    width: 2478,
    height: 1292,
  },
  {
    src: "/Client3.png",
    alt: "Client project 3",
    width: 2628,
    height: 1380,
  },
] as const;

export default function Profile() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeClient = CLIENTS[activeIndex];

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + CLIENTS.length) % CLIENTS.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % CLIENTS.length);
  }

  return (
    <section className={styles.profile} id="profile" aria-label="Profile">
      <div className={styles.collage}>
        <ul className={styles.stickers} aria-hidden="true">
          {STICKERS.map((sticker) => (
            <li key={sticker.src} className={`${styles.sticker} ${sticker.className}`}>
              <Image
                src={sticker.src}
                alt=""
                width={sticker.width}
                height={sticker.height}
                className={styles.stickerImage}
                draggable={false}
              />
            </li>
          ))}
        </ul>

        <div className={styles.portrait}>
          <Image
            src="/Cut-Out-Me.png"
            alt="Aaron Ong"
            width={1537}
            height={1023}
            className={styles.portraitImage}
            priority
          />
        </div>
      </div>

      <div className={styles.bio}>
        <p className={styles.greeting}>
          Hi 👋, my name is <strong>Aaron</strong>.
        </p>
        <p>
          I&apos;m a South Texas-based software developer and digital creative helping local businesses grow through modern websites, marketing designs, and practical digital tools. I combine clean, responsive web development with brand-focused marketing visuals, using AI-powered workflows to improve efficiency, speed up creative production, and deliver polished digital experiences. 
        </p>
      </div>

      <div className={styles.clients}>
        <h2 className={styles.clientsHeading}>
          Some of the clients I&apos;ve worked with
        </h2>

        <div className={styles.deskSetup}>
          <div className={styles.slideshow}>
            <button
              type="button"
              className={styles.slideNav}
              onClick={showPrevious}
              aria-label="Previous client"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M15 5.5 8.5 12 15 18.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className={styles.monitor} aria-live="polite">
              <div className={styles.monitorScreen}>
                <Image
                  key={activeClient.src}
                  src={activeClient.src}
                  alt={activeClient.alt}
                  width={activeClient.width}
                  height={activeClient.height}
                  className={styles.monitorScreenImage}
                  draggable={false}
                  priority={activeIndex === 0}
                />
              </div>
              <Image
                src="/Apple-Monitor.png"
                alt=""
                width={1433}
                height={1098}
                className={styles.monitorImage}
                draggable={false}
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              className={styles.slideNav}
              onClick={showNext}
              aria-label="Next client"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M9 5.5 15.5 12 9 18.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <Image
            src="/White-Keyboard.png"
            alt=""
            width={1434}
            height={1097}
            className={styles.keyboardImage}
            draggable={false}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
