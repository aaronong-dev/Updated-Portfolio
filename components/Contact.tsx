import Image from "next/image";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <section className={styles.contact} id="contact" aria-label="Contact">
      <h2 className={styles.heading}>
        Got something in mind? Send me a message.
      </h2>
      <div className={styles.messageTarget}>
        <Image
          src="/Click Me-transparent.png"
          alt=""
          width={500}
          height={500}
          className={styles.clickMe}
          draggable={false}
          aria-hidden="true"
          unoptimized
        />
        <button type="button" className={styles.messageButton} aria-label="Messages">
          <Image
            src="/Message-Icon.png"
            alt=""
            width={256}
            height={256}
            className={styles.messageIcon}
            draggable={false}
          />
        </button>
      </div>
    </section>
  );
}
