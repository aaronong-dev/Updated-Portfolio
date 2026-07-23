import Image from "next/image";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Profile", href: "#profile" },
  { label: "Projects", href: "#projects" },
] as const;

const CONNECT_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/aaron-ong-77b642158/",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/aaronong-dev",
    external: true,
  },
  {
    label: "Email",
    href: "#contact",
    external: false,
  },
] as const;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src="/Laptop-Favicon.png"
            alt=""
            width={32}
            height={32}
            className={styles.favicon}
            unoptimized
            aria-hidden="true"
          />
          <div className={styles.brandText}>
            <p className={styles.name}>Aaron Ong</p>
            <p className={styles.role}>Software Developer</p>
          </div>
        </div>

        <div className={styles.columns}>
          <nav className={styles.column} aria-label="Quick links">
            <p className={styles.columnLabel}>Quick Links</p>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-label="Connect">
            <p className={styles.columnLabel}>Connect</p>
            <ul className={styles.linkList}>
              {CONNECT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className={styles.link}
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className={styles.bottom}>
        <hr className={styles.divider} />
        <p className={styles.credit}>
          Built and designed by Aaron Ong. All rights reserved. ©
        </p>
      </div>
    </footer>
  );
}
