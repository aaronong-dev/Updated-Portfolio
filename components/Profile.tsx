"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type TransitionEvent } from "react";
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
    src: "/services/Brand-Design.jpg",
    label: "Brand & Visual Design",
    alt: "Brand & Visual Design",
  },
  {
    src: "/services/Software-Development.jpg",
    label: "Software Development",
    alt: "Software Development",
    objectPosition: "center 75%",
  },
  {
    src: "/services/Web-Development.jpg",
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

const GALLERY_LOOP = [
  ...GALLERY_IMAGES,
  ...GALLERY_IMAGES,
  ...GALLERY_IMAGES,
];

const SECONDARY_GALLERY_IMAGES = [
  {
    src: "/languages/Javascript-Logo.png",
    label: "JavaScript",
    alt: "JavaScript",
    logo: true,
    background:
      "linear-gradient(160deg, #f7df1e 0%, #e8c217 42%, #c9a00c 100%)",
  },
  {
    src: "/languages/python-logo.webp",
    label: "Python",
    alt: "Python",
    logo: true,
    background:
      "linear-gradient(155deg, #4584b6 0%, #2b5a87 48%, #ffd43b 100%)",
  },
  {
    src: "/languages/React-Icon.webp",
    label: "React",
    alt: "React",
    logo: true,
    background:
      "linear-gradient(150deg, #0b1a24 0%, #163447 45%, #1b6b7a 100%)",
  },
  {
    src: "/languages/Nextjs-Logo.png",
    label: "Next.js",
    alt: "Next.js",
    logo: true,
    invertLogo: true,
    background:
      "linear-gradient(145deg, #2a2a2e 0%, #111113 55%, #000000 100%)",
  },
  {
    src: "/languages/Cursor-Logo.png",
    label: "Cursor",
    alt: "Cursor",
    logo: true,
    background:
      "linear-gradient(160deg, #3d2a5c 0%, #1a1228 50%, #0c0a12 100%)",
  },
] as const;

const SECONDARY_GALLERY_LOOP = [
  ...SECONDARY_GALLERY_IMAGES,
  ...SECONDARY_GALLERY_IMAGES,
  ...SECONDARY_GALLERY_IMAGES,
];

type GalleryItem = {
  src: string;
  label: string;
  alt: string;
  objectPosition?: string;
  logo?: boolean;
  invertLogo?: boolean;
  background?: string;
};

function GalleryStrip({
  loop,
  className,
  label,
  index,
  animate,
  onPauseChange,
  onTransitionEnd,
}: {
  loop: readonly GalleryItem[];
  className?: string;
  label: string;
  index: number;
  animate: boolean;
  onPauseChange: (paused: boolean) => void;
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`${styles.gallery} ${className ?? ""}`}
      aria-label={label}
      onPointerEnter={() => onPauseChange(true)}
      onPointerLeave={() => onPauseChange(false)}
    >
      <div className={styles.galleryViewport}>
        <div
          className={`${styles.galleryTrack} ${
            animate ? "" : styles.galleryTrackInstant
          }`}
          style={
            {
              "--gallery-index": String(index),
            } as CSSProperties
          }
          onTransitionEnd={onTransitionEnd}
        >
          {loop.map((image, imageIndex) => (
            <figure
              key={`${image.src}-${imageIndex}`}
              className={`${styles.gallerySlide} ${
                image.logo ? styles.gallerySlideLogo : ""
              }`}
              style={
                image.background
                  ? { background: image.background }
                  : undefined
              }
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.logo ? 512 : 900}
                height={image.logo ? 512 : 1200}
                sizes={
                  image.logo
                    ? "(max-width: 700px) 28vw, 18vw"
                    : "(max-width: 700px) 42vw, 36vw"
                }
                className={
                  image.logo
                    ? `${styles.galleryLogoImage}${
                        image.invertLogo ? ` ${styles.galleryLogoInvert}` : ""
                      }`
                    : styles.galleryImage
                }
                style={
                  image.objectPosition
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
  );
}

const CLIENTS = [
  {
    src: "/profile/clients/Client1.jpg",
    alt: "Client project 1",
    href: "https://www.jkmedicalclinic.com/",
    width: 1600,
    height: 868,
  },
  {
    src: "/profile/clients/Client2.jpg",
    alt: "Client project 2",
    href: "https://www.medicosencasapllc.com/",
    width: 1600,
    height: 834,
  },
  {
    src: "/profile/clients/Client3.jpg",
    alt: "Client project 3",
    href: "https://www.haciendadelsolresort.com/",
    width: 1600,
    height: 840,
  },
  {
    src: "/profile/clients/Client4.jpg",
    alt: "All Med Home Care",
    href: "https://www.allmedhomecare.com/",
    width: 1600,
    height: 784,
  },
  {
    src: "/profile/clients/Client5.jpg",
    alt: "Southern Charm Vacation Home",
    href: "https://www.southerncharmspi.com/",
    width: 1600,
    height: 914,
  },
];

/* Edit these placeholder names/urls for the "View all" modal list. */
const ALL_CLIENTS = [
  { name: "JK Medical Clinic", href: "https://www.jkmedicalclinic.com/" },
  { name: "Hacienda Del Sol Resort", href: "https://www.haciendadelsolresort.com/" },
  { name: "Medicos En Casa PLLC", href: "https://www.medicosencasapllc.com/" },
  { name: "All Med Home Care", href: "https://www.allmedhomecare.com/" },
  { name: "Southern Charm SPI", href: "https://www.southerncharmspi.com/" },
  { name: "CLV Construction", href: "https://clvconstructionllc.com/" },
  { name: "Cascos & Associates", href: "https://cascoscpa.com/" },
];

export default function Profile() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [clientsModalOpen, setClientsModalOpen] = useState(false);
  const [collagePopped, setCollagePopped] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);
  const galleryCount = GALLERY_IMAGES.length;
  const secondaryGalleryCount = SECONDARY_GALLERY_IMAGES.length;
  const [galleryIndex, setGalleryIndex] = useState<number>(galleryCount);
  const [secondaryGalleryIndex, setSecondaryGalleryIndex] = useState<number>(
    secondaryGalleryCount,
  );
  const [galleryAnimate, setGalleryAnimate] = useState(true);
  const [secondaryGalleryAnimate, setSecondaryGalleryAnimate] = useState(true);
  const [primaryGalleryPaused, setPrimaryGalleryPaused] = useState(false);
  const [secondaryGalleryPaused, setSecondaryGalleryPaused] = useState(false);
  const [linkPreviewOpen, setLinkPreviewOpen] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const linkPreviewWrapRef = useRef<HTMLSpanElement | null>(null);
  const galleryPausedRef = useRef(false);
  const activeClient = CLIENTS[activeIndex];
  galleryPausedRef.current = primaryGalleryPaused || secondaryGalleryPaused;
  const screenImage = (
    <Image
      key={activeClient.src}
      src={activeClient.src}
      alt={activeClient.alt}
      width={activeClient.width}
      height={activeClient.height}
      sizes="(max-width: 700px) 78vw, min(80vw, 44rem)"
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
      setSecondaryGalleryAnimate(true);
      setGalleryIndex((index) => index + 1);
      setSecondaryGalleryIndex((index) => index + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  function wrapGalleryIndex({
    index,
    count,
    setAnimate,
    setIndex,
  }: {
    index: number;
    count: number;
    setAnimate: (animate: boolean) => void;
    setIndex: (updater: (index: number) => number) => void;
  }) {
    if (index >= count * 2) {
      setAnimate(false);
      setIndex((current) => current - count);
    } else if (index < count) {
      setAnimate(false);
      setIndex((current) => current + count);
    } else {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });
  }

  function handleGalleryTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "transform") return;
    wrapGalleryIndex({
      index: galleryIndex,
      count: galleryCount,
      setAnimate: setGalleryAnimate,
      setIndex: setGalleryIndex,
    });
  }

  function handleSecondaryGalleryTransitionEnd(
    event: TransitionEvent<HTMLDivElement>,
  ) {
    if (event.propertyName !== "transform") return;
    wrapGalleryIndex({
      index: secondaryGalleryIndex,
      count: secondaryGalleryCount,
      setAnimate: setSecondaryGalleryAnimate,
      setIndex: setSecondaryGalleryIndex,
    });
  }

  function goToGallerySlide(target: number) {
    const current =
      ((secondaryGalleryIndex % secondaryGalleryCount) +
        secondaryGalleryCount) %
      secondaryGalleryCount;
    if (target === current) return;

    const forward =
      (target - current + secondaryGalleryCount) % secondaryGalleryCount;
    const backward =
      (current - target + secondaryGalleryCount) % secondaryGalleryCount;

    setGalleryAnimate(true);
    setSecondaryGalleryAnimate(true);
    // Prefer backward motion when going to an earlier slide so cards enter from the left
    if (backward < forward) {
      setGalleryIndex(galleryIndex - backward);
      setSecondaryGalleryIndex(secondaryGalleryIndex - backward);
    } else {
      setGalleryIndex(galleryIndex + forward);
      setSecondaryGalleryIndex(secondaryGalleryIndex + forward);
    }
  }

  function playClickSound() {
    if (!clickSoundRef.current) {
      clickSoundRef.current = new Audio("/profile/Keyboard-Click.mp3");
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

  function isCoarsePointer() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  }

  function positionMobilePreview() {
    const wrap = linkPreviewWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    wrap.style.setProperty("--link-preview-top", `${rect.top}px`);
  }

  function handlePreviewLeave() {
    if (linkPreviewOpen) return;
    pausePreviewVideo();
  }

  function handleUniLinkClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    if (!isCoarsePointer()) return;
    if (!linkPreviewOpen) {
      event.preventDefault();
      positionMobilePreview();
      setLinkPreviewOpen(true);
      playPreviewVideo();
      return;
    }
    setLinkPreviewOpen(false);
    pausePreviewVideo();
  }

  useEffect(() => {
    if (!linkPreviewOpen) return;

    function onPointerDown(event: PointerEvent) {
      const wrap = linkPreviewWrapRef.current;
      if (!wrap || wrap.contains(event.target as Node)) return;
      setLinkPreviewOpen(false);
      pausePreviewVideo();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setLinkPreviewOpen(false);
      pausePreviewVideo();
    }

    function onReposition() {
      positionMobilePreview();
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [linkPreviewOpen]);

  useEffect(() => {
    if (!clientsModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setClientsModalOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [clientsModalOpen]);

  useEffect(() => {
    const collage = collageRef.current;
    if (!collage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCollagePopped(entry.isIntersecting);
      },
      {
        threshold: 0.4,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(collage);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.profile} id="profile" aria-label="Profile">
      <div
        ref={collageRef}
        className={`${styles.collage}${collagePopped ? ` ${styles.collagePopped}` : ""}`}
      >
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
            src="/profile/Cut-Out-Me.png"
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
            ref={linkPreviewWrapRef}
            className={`${styles.linkPreviewWrap}${linkPreviewOpen ? ` ${styles.linkPreviewOpen}` : ""}`}
            onPointerEnter={playPreviewVideo}
            onPointerLeave={handlePreviewLeave}
            onFocus={playPreviewVideo}
            onBlur={handlePreviewLeave}
          >
            <a
              href="https://www.utrgv.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.uniLink}
              onClick={handleUniLinkClick}
            >
              The University of Texas Rio Grande Valley
            </a>
            <span className={styles.linkPreview} aria-hidden="true">
              <span className={styles.linkPreviewMedia}>
                <video
                  ref={previewVideoRef}
                  className={styles.linkPreviewImage}
                  src="/profile/Graduation-Clip.MOV"
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

      <GalleryStrip
        loop={GALLERY_LOOP}
        label="Services gallery"
        index={galleryIndex}
        animate={galleryAnimate}
        onPauseChange={setPrimaryGalleryPaused}
        onTransitionEnd={handleGalleryTransitionEnd}
      />
      <div className={styles.gallerySecondaryWrap}>
        <GalleryStrip
          loop={SECONDARY_GALLERY_LOOP}
          className={styles.gallerySecondary}
          label="Technologies gallery"
          index={secondaryGalleryIndex}
          animate={secondaryGalleryAnimate}
          onPauseChange={setSecondaryGalleryPaused}
          onTransitionEnd={handleSecondaryGalleryTransitionEnd}
        />
        <div
          className={styles.galleryDots}
          role="tablist"
          aria-label="Technology slides"
          onPointerEnter={() => setSecondaryGalleryPaused(true)}
          onPointerLeave={() => setSecondaryGalleryPaused(false)}
        >
          {SECONDARY_GALLERY_IMAGES.map((image, index) => {
            const isActive =
              ((secondaryGalleryIndex % secondaryGalleryCount) +
                secondaryGalleryCount) %
                secondaryGalleryCount ===
              index;
            return (
              <button
                key={image.src}
                type="button"
                role="tab"
                className={`${styles.galleryDot} ${
                  isActive ? styles.galleryDotActive : ""
                }`}
                aria-label={`Go to ${image.label}`}
                aria-selected={isActive}
                onClick={() => goToGallerySlide(index)}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.clients}>
        <h2 className={styles.clientsHeading}>
          Some of the clients I&apos;ve worked with
        </h2>
        <button
          type="button"
          className={styles.clientsViewAll}
          onClick={() => setClientsModalOpen(true)}
        >
          View all
        </button>

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
                src="/profile/Apple-Monitor.png"
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
            src="/profile/White-Keyboard.png"
            alt=""
            width={1353}
            height={523}
            className={styles.keyboardImage}
            draggable={false}
            aria-hidden="true"
          />
        </div>
      </div>

      {clientsModalOpen ? (
        <div
          className={styles.clientsModalBackdrop}
          onClick={() => setClientsModalOpen(false)}
        >
          <div
            className={styles.clientsModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clients-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.clientsModalHeader}>
              <h3 id="clients-modal-title" className={styles.clientsModalTitle}>
                Clients
              </h3>
              <button
                type="button"
                className={styles.clientsModalClose}
                onClick={() => setClientsModalOpen(false)}
                aria-label="Close clients list"
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

            <ul className={styles.clientsModalList}>
              {ALL_CLIENTS.map((client, index) => (
                <li key={`${client.name}-${index}`} className={styles.clientsModalItem}>
                  <a
                    className={styles.clientsModalLink}
                    href={client.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {client.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
