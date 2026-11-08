import { ARTIST, CONTACT_EMAIL, INSTAGRAM, SITE } from '../site.ts';

export function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="More">
        <a href={INSTAGRAM} rel="noopener">
          Instagram
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </nav>
      <p className="site-footer__legal">
        © {new Date().getFullYear()} {SITE} · {ARTIST}
      </p>
    </footer>
  );
}
