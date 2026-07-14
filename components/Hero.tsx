import GridBackground from "./GridBackground";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <GridBackground />
    </section>
  );
}
