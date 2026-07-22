import Image from "next/image";
import styles from "./Projects.module.css";

type ProjectLanguage = {
  name: string;
  background: string;
  color?: string;
};

type Project = {
  id: string;
  label?: string;
  title: string;
  languages: ProjectLanguage[];
  description?: string;
  href: string;
  visitHref?: string;
  theme: "light" | "dark";
  image?: string;
};

const PROJECTS: Project[] = [
  {
    id: "one",
    label: "Web App",
    title: "Bowling-Tournaments.com",
    languages: [
      { name: "NEXTJS", background: "#ffffff", color: "#000000" },
      { name: "TYPESCRIPT", background: "#3178C6", color: "#ffffff" },
    ],
    description:
      "A platform for finding and tracking bowling tournaments worldwide.",
    href: "/bowling-tournaments",
    visitHref: "https://www.bowling-tournaments.com",
    theme: "dark",
    image: "/projects/bowling-tournaments-hero.png",
  },
  {
    id: "two",
    title: "Project Two",
    languages: [],
    href: "#",
    theme: "dark",
  },
];

export default function Projects() {
  return (
    <div className={styles.wrapper} id="projects">
      <section className={styles.header} aria-label="Projects">
        <h2 className={styles.heading}>Projects</h2>
        <p className={styles.subheading}>See my latest work.</p>
        <div className={styles.pencils} aria-hidden="true">
          <Image
            src="/collage-stickers/Apple-Pencil.png"
            alt=""
            width={1434}
            height={1097}
            className={`${styles.pencil} ${styles.pencilLeft}`}
          />
          <Image
            src="/collage-stickers/Apple-Pencil.png"
            alt=""
            width={1434}
            height={1097}
            className={`${styles.pencil} ${styles.pencilRight}`}
          />
        </div>
      </section>
      <section className={styles.projects} aria-label="Project list">
        <div className={styles.grid}>
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              className={`${styles.tile} ${
                project.theme === "dark" ? styles.tileDark : styles.tileLight
              } ${project.image ? styles.tileHasImage : ""}`}
            >
              {project.image ? (
                <div className={styles.bg} aria-hidden="true">
                  <Image
                    src={project.image}
                    alt=""
                    width={1390}
                    height={580}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.bgImage}
                    priority={project.id === "one"}
                  />
                  <div className={styles.bgGradient} />
                </div>
              ) : null}

              <div className={styles.copy}>
                {project.label ? (
                  <p className={styles.label}>{project.label}</p>
                ) : null}
                <h2 className={styles.title}>{project.title}</h2>
                {project.languages.length > 0 ? (
                  <ul className={styles.languages}>
                    {project.languages.map((language) => (
                      <li
                        key={language.name}
                        className={styles.language}
                        style={{
                          backgroundColor: language.background,
                          color: language.color ?? "#fff",
                        }}
                      >
                        {language.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {project.description ? (
                  <p className={styles.description}>{project.description}</p>
                ) : null}
                <div className={styles.ctas}>
                  <a className={styles.ctaPrimary} href={project.href}>
                    Read More
                  </a>
                  {project.visitHref ? (
                    <a
                      className={styles.ctaSecondary}
                      href={project.visitHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  ) : null}
                </div>
              </div>

              {!project.image ? (
                <div className={styles.art} aria-hidden="true">
                  <div className={styles.artPlaceholder} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
