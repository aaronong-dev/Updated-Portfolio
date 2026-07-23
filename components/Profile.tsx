"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from "react";
import styles from "./Profile.module.css";

const STICKERS = [
  {
    src: "/collage-stickers/Ultrawide-Monitor.png",
    alt: "Ultrawide monitor",
    width: 1536,
    height: 1024,
    className: styles.stickerUltrawide,
  },
  {
    src: "/collage-stickers/Macbook-Pro.png",
    alt: "MacBook",
    width: 1536,
    height: 1024,
    className: styles.stickerMacbook,
  },
  {
    src: "/collage-stickers/IPad-Notes.png",
    alt: "iPad",
    width: 1013,
    height: 1553,
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

const GALLERY_IMAGES = [
  {
    src: "/services/Brand-Design.JPG",
    label: "Brand & Visual Design",
    alt: "Brand & Visual Design",
  },
  {
    src: "/services/Software-Development.JPG",
    label: "Software Development",
    alt: "Software Development",
    objectPosition: "center 75%",
  },
  {
    src: "/services/Web-Development.png",
    label: "Web Development",
    alt: "Web Development",
  },
  {
    src: "/services/Photography.jpg",
    label: "Photography",
    alt: "Photography",
    objectPosition: "center 62%",
  },
] as const;

const GALLERY_LOOP = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

const CLIENTS = [
  {
    src: "/Client1.png",
    alt: "Client project 1",
    href: "https://www.jkmedicalclinic.com/",
    width: 2248,
    height: 1220,
  },
  {
    src: "/Client2.png",
    alt: "Client project 2",
    href: "https://www.medicosencasapllc.com/",
    width: 2478,
    height: 1292,
  },
  {
    src: "/Client3.png",
    alt: "Client project 3",
    href: "https://www.haciendadelsolresort.com/",
    width: 2628,
    height: 1380,
  },
  {
    src: "/Client4.png",
    alt: "All Med Home Care",
    href: "https://www.allmedhomecare.com/",
    width: 2828,
    height: 1386,
  },
  {
    src: "/Client5.png",
    alt: "Southern Charm Vacation Home",
    href: "https://www.southerncharmspi.com/",
    width: 2552,
    height: 1458,
  },
];

export default function Profile() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryAnimate, setGalleryAnimate] = useState(true);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const galleryPausedRef = useRef(galleryPaused);
  const activeClient = CLIENTS[activeIndex];
  const galleryCount = GALLERY_IMAGES.length;
  galleryPausedRef.current = galleryPaused;
  const screenImage = (
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
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      if (galleryPausedRef.current) return;
      setGalleryAnimate(true);
      setGalleryIndex((index) => index + 1);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  function handleGalleryTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "transform") return;
    if (galleryIndex < galleryCount) return;

    setGalleryAnimate(false);
    setGalleryIndex((index) => index - galleryCount);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGalleryAnimate(true);
      });
    });
  }

  function playClickSound() {
    if (!clickSoundRef.current) {
      clickSoundRef.current = new Audio("/Keyboard-Click.mp3");
    }
    const sound = clickSoundRef.current;
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  }

  function showPrevious() {
    playClickSound();
    setActiveIndex((index) => (index - 1 + CLIENTS.length) % CLIENTS.length);
  }

  function showNext() {
    playClickSound();
    setActiveIndex((index) => (index + 1) % CLIENTS.length);
  }

  function playPreviewVideo() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const video = previewVideoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }

  function pausePreviewVideo() {
    const video = previewVideoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
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
          I&apos;m a South Texas-based software developer and recent graduate
          from{" "}
          <span
            className={styles.linkPreviewWrap}
            onPointerEnter={playPreviewVideo}
            onPointerLeave={pausePreviewVideo}
            onFocus={playPreviewVideo}
            onBlur={pausePreviewVideo}
          >
            <a
              href="https://www.utrgv.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.uniLink}
            >
              The University of Texas Rio Grande Valley
            </a>
            <span className={styles.linkPreview} aria-hidden="true">
              <span className={styles.linkPreviewMedia}>
                <video
                  ref={previewVideoRef}
                  className={styles.linkPreviewImage}
                  src="/Graduation-Clip.MOV"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </span>
              <span className={styles.linkPreviewBody}>
                <span className={styles.linkPreviewTitle}>
                  The University of Texas Rio Grande Valley | UTRGV
                </span>
                <span className={styles.linkPreviewDesc}>
                  Home of the #1 University in Texas.
                </span>
                <span className={styles.linkPreviewUrl}>utrgv.edu</span>
              </span>
            </span>
          </span>
          , where I studied Computer Science. Currently, I help local businesses
          grow through modern websites, marketing designs, and practical digital
          tools, combining clean, responsive web development with brand-focused
          visuals and AI-powered workflows.
        </p>
      </div>

      <div
        className={styles.gallery}
        aria-label="Photo gallery"
        onPointerEnter={() => setGalleryPaused(true)}
        onPointerLeave={() => setGalleryPaused(false)}
      >
        <div className={styles.galleryViewport}>
          <div
            className={`${styles.galleryTrack} ${
              galleryAnimate ? "" : styles.galleryTrackInstant
            }`}
            style={
              {
                "--gallery-index": String(galleryIndex),
              } as CSSProperties
            }
            onTransitionEnd={handleGalleryTransitionEnd}
          >
            {GALLERY_LOOP.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                className={styles.gallerySlide}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={1200}
                  className={styles.galleryImage}
                  style={
                    "objectPosition" in image && image.objectPosition
                      ? { objectPosition: image.objectPosition }
                      : undefined
                  }
                  draggable={false}
                />
                <figcaption className={styles.galleryLabel}>
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
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
              <svg viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                <path d="M8.5 1 1.5 6l7 5z" fill="currentColor" />
              </svg>
            </button>

            <div className={styles.monitor} aria-live="polite">
              <div className={styles.monitorScreen}>
                {activeClient.href ? (
                  <a
                    href={activeClient.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.monitorScreenLink}
                    aria-label={`Visit ${activeClient.alt}`}
                  >
                    {screenImage}
                  </a>
                ) : (
                  screenImage
                )}
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
              <svg viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                <path d="M1.5 1 8.5 6l-7 5z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <Image
            src="/White-Keyboard.png"
            alt=""
            width={1353}
            height={523}
            className={styles.keyboardImage}
            draggable={false}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
