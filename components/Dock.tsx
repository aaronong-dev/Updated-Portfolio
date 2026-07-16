"use client";

import Image from "next/image";
import styles from "./Dock.module.css";

const DOCK_ITEMS = [
  {
    label: "Home",
    src: "/docker-icons/Home-Button.png",
  },
  {
    label: "Projects",
    src: "/docker-icons/Folder-Icon.png",
  },
  {
    label: "Profile",
    src: "/docker-icons/Profile-Icon.png",
  },
  {
    label: "LinkedIn",
    src: "/docker-icons/Linked-In-Icon.png",
  },
  {
    label: "GitHub",
    src: "/docker-icons/GitHub-Logo.png",
  },
] as const;

export default function Dock() {
  return (
    <nav className={styles.dock} aria-label="Dock">
      <ul className={styles.tray}>
        {DOCK_ITEMS.map((item) => (
          <li key={item.label} className={styles.item}>
            <button type="button" className={styles.button} aria-label={item.label}>
              <Image
                src={item.src}
                alt=""
                width={96}
                height={96}
                className={styles.icon}
                draggable={false}
              />
              <span className={styles.tooltip}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
