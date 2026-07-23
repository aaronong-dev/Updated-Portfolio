import type { Metadata } from "next";
import { Bebas_Neue, Oswald } from "next/font/google";
import Image from "next/image";
import styles from "./page.module.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const oswald = Oswald({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Bowling Tournaments — Aaron Ong",
  description:
    "Bowling-Tournaments.com — a platform for finding and tracking bowling tournaments worldwide.",
};

export default function BowlingTournamentsPage() {
  return (
    <main className={`${styles.page} ${bebasNeue.variable} ${oswald.variable}`}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <Image
            className={styles.logo}
            src="/bowling-tournaments/bt-logo-2.png"
            alt=""
            width={960}
            height={1113}
            priority
          />
          <p className={styles.brandName}>
            BOWLING-TOURNAMENTS
            <span className={styles.brandTld}>.COM</span>
          </p>
        </div>
      </header>

      <section className={styles.hero} aria-label="Hero">
        <h1 className={styles.visuallyHidden}>Find your next tournament</h1>
        <Image
          className={styles.image}
          src="/bowling-tournaments/hero-section.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </section>

      <section className={styles.why} aria-labelledby="why-heading">
        <h2 id="why-heading" className={styles.sectionHeading}>
          Why I built this.
        </h2>
        <p className={styles.sectionDescription}>
          I&apos;ve always loved bowling, especially as a kid. I started
          competing when I was 15 years old, and I&apos;ve stuck with it ever
          since. For this project, I wanted to build something I was passionate
          about, and what better project to work on than a platform for the sport
          that&apos;s shaped so much of my life?
        </p>
      </section>

      <section className={styles.problem} aria-labelledby="problem-heading">
        <h2 id="problem-heading" className={styles.sectionHeading}>
          The Problem.
        </h2>
        <p className={styles.sectionDescription}>
          I noticed that local tournament directors were still relying on Excel
          sheets to track scores. The problem was that bowlers had no way to
          follow results in real time, often facing long waits just to find out
          who won.
        </p>
      </section>

      <section className={styles.solution} aria-labelledby="solution-heading">
        <h2 id="solution-heading" className={styles.sectionHeading}>
          The Solution.
        </h2>
        <p className={styles.sectionDescription}>
          I built a full-stack web application using TypeScript, Next.js, and
          Firebase to handle authentication, database management, and backend
          services. The platform helps bowling tournament directors create and
          manage tournaments more efficiently, while giving players an easier way
          to discover events, view details, and follow updates in real time.
        </p>
      </section>

      <section className={styles.features} aria-labelledby="features-heading">
        <h2 id="features-heading" className={styles.sectionHeading}>
          Project Features
        </h2>
      </section>

      <section className={styles.featureRow} aria-label="Tournament discovery">
        <div className={styles.featureMedia}>
          <Image
            className={styles.featureLaptop}
            src="/bowling-tournaments/Laptop-1.png"
            alt="Bowling-Tournaments.com tournaments page on a laptop, with region search open"
            width={1536}
            height={1024}
            sizes="(max-width: 900px) 100vw, 62vw"
          />
        </div>
        <div className={styles.featureCopy}>
          <h3 className={styles.featureTitle}>
            Find and follow bowling tournaments,{" "}
            <span className={styles.featureAccent}>anywhere</span> in the world.
          </h3>
        </div>
      </section>

      <section
        className={`${styles.featureRow} ${styles.featureRowReverse}`}
        aria-label="Follow directors"
      >
        <div className={styles.featureCopy}>
          <h3 className={styles.featureTitle}>
            Follow tournament directors and get{" "}
            <span className={styles.featureAccent}>notified</span> the moment
            they post a new tournament.
          </h3>
        </div>
        <div className={styles.featureMedia}>
          <Image
            className={styles.featureLaptop}
            src="/bowling-tournaments/Laptop-2.png"
            alt="Bowling-Tournaments.com director profile page on a laptop"
            width={1536}
            height={1024}
            sizes="(max-width: 900px) 100vw, 62vw"
          />
        </div>
      </section>
    </main>
  );
}
