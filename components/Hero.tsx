"use client";

import Image from "next/image";
import { DockDemo } from "@/components/ui/dock-demo";
import GridBackground from "./GridBackground";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <GridBackground />
      <div className={styles.backdropName} aria-hidden="true">
        <div className={styles.backdropCopy}>
          <p className={styles.backdropHeading}>AARON ONG</p>
          <p className={styles.backdropTitle}>Full-Stack Developer</p>
        </div>
      </div>
      <div className={styles.portrait}>
        <Image
          src="/Personal-Profile.png"
          alt="Aaron Ong"
          width={1200}
          height={800}
          priority
          className={styles.portraitImage}
        />
      </div>
      <div className={styles.dock}>
        <DockDemo />
      </div>
    </section>
  );
}
