import Link from "next/link";
import { CTA_LINK, NAV_LINKS } from "@/lib/navLinks";
import styles from "./SiteNav.module.css";

/**
 * Menú principal + botón "Compra ahora". Es el mismo en la home y en todas las vistas.
 * Va dentro del escenario 1920x1080 (usa --u). Los enlaces se editan en lib/navLinks.ts y el aspecto en SiteNav.module.css.
 */
export default function SiteNav() {
  return (
    <>
      <nav className={styles.nav} aria-label="Principal">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={styles.tag}>
            {l.label}
          </Link>
        ))}
      </nav>
      <Link href={CTA_LINK.href} className={`${styles.tag} ${styles.cta}`}>
        {CTA_LINK.label}
      </Link>
    </>
  );
}
