"use client";

import Image from "next/image";
import { DockDemo } from "@/components/ui/dock-demo";
import GridBackground from "./GridBackground";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <GridBackground />
      <div className={styles.portrait}>
        <Image
          src="/Meee.png"
          alt="Aaron Ong"
          width={720}
          height={960}
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
