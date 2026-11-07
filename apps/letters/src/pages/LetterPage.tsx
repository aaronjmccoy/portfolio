import { useEffect, useRef, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link, useNavigate, useParams } from 'react-router';
import type { LetterPageQuery as QueryType } from '../__generated__/LetterPageQuery.graphql.ts';
import { fetchPolicy } from '../routes.tsx';
import { Title } from '../components/Title.tsx';
import { NotFound } from '../components/NotFound.tsx';

export const LetterPageQuery = graphql`
  query LetterPageQuery($key: String!) {
    letter(key: $key) {
      id
      key
      number
      variant
      group
      section {
        key
        chapter
        title
      }
      pages {
        id
        page
        order
        original
        image {
          src
          srcset
          width
          height
        }
      }
      companions {
        id
        page
        ext
        original
      }
      transcription {
        markdown
        source
      }
      previous {
        key
        number
        variant
      }
      next {
        key
        number
        variant
      }
    }
  }
`;

export function LetterPage() {
  const { key = '' } = useParams();
  const data = useLazyLoadQuery<QueryType>(LetterPageQuery, { key }, { fetchPolicy });
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [shownKey, setShownKey] = useState(key);
  const pagesRef = useRef<HTMLDivElement>(null);

  // Reset to the first page when the letter changes, adjusting state during
  // render (React's sanctioned pattern) rather than from an effect.
  if (shownKey !== key) {
    setShownKey(key);
    setCurrent(0);
  }

  const letter = data.letter;
  const pages = letter?.pages ?? [];
  const page = pages[current];

  // Keyboard paging works anywhere on the page; links and buttons still get
  // their own keys first because we only listen for arrows.
  useEffect(() => {
    if (!letter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === 'ArrowRight' && current < pages.length - 1) setCurrent(current + 1);
      else if (e.key === 'ArrowLeft' && current > 0) setCurrent(current - 1);
      else if (e.key === 'ArrowRight' && letter.next && current === pages.length - 1) navigate(`/letter/${letter.next.key}`);
      else if (e.key === 'ArrowLeft' && letter.previous && current === 0) navigate(`/letter/${letter.previous.key}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, pages.length, letter, navigate]);

  if (!letter) return <NotFound what="letter" />;

  const name = `Letter ${letter.number}${letter.variant ?? ''}`;
  const chapter = letter.section.chapter === null ? letter.section.title : `Chapter ${letter.section.chapter}: ${letter.section.title}`;

  return (
    <article className="letter">
      <Title text={`${name} — ${chapter}`} />
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/letters">Letters</Link> › <Link to={`/chapter/${letter.section.key}`}>{chapter}</Link>
      </nav>
      <header className="letter__header">
        <h1 className="letter__title">{name}</h1>
        {letter.group ? <p className="letter__group">{letter.group}</p> : null}
      </header>

      <div className="letter__body">
        <section className="scans" aria-labelledby="scans-heading" ref={pagesRef}>
          <h2 id="scans-heading" className="visually-hidden">
            Scanned pages
          </h2>
          {page ? (
            <figure className="scan">
              {page.image ? (
                <a href={page.original} className="scan__link" aria-label={`Open the original scan of ${name}, page ${current + 1}`}>
                  <img
                    className="scan__img"
                    src={page.image.src}
                    srcSet={page.image.srcset}
                    width={page.image.width ?? undefined}
                    height={page.image.height ?? undefined}
                    sizes="(min-width: 64rem) 50vw, 100vw"
                    alt={`${name}, page ${current + 1} of ${pages.length}${letter.transcription ? '; transcription alongside' : '; not yet transcribed'}`}
                    decoding="async"
                    fetchPriority={current === 0 ? 'high' : 'auto'}
                  />
                </a>
              ) : null}
              <figcaption className="scan__caption">
                Page {current + 1} of {pages.length}
              </figcaption>
            </figure>
          ) : (
            <p>No scans for this letter.</p>
          )}
          {pages.length > 1 ? (
            <div className="pager" role="group" aria-label="Pages">
              <button type="button" className="button" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
                ‹ Previous page
              </button>
              <ol className="pager__thumbs">
                {pages.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="pager__thumb"
                      aria-current={i === current ? 'true' : undefined}
                      aria-label={`Page ${i + 1}`}
                      onClick={() => setCurrent(i)}
                    >
                      {p.image ? (
                        <img
                          src={p.image.src}
                          srcSet={p.image.srcset}
                          width={p.image.width ?? undefined}
                          height={p.image.height ?? undefined}
                          sizes="4rem"
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        i + 1
                      )}
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className="button" onClick={() => setCurrent((c) => Math.min(pages.length - 1, c + 1))} disabled={current === pages.length - 1}>
                Next page ›
              </button>
            </div>
          ) : null}
          <p className="scan__hint">Use ← and → to turn pages.</p>
        </section>

        <section className="transcript" aria-labelledby="transcript-heading">
          <h2 id="transcript-heading">Transcription</h2>
          {letter.transcription ? (
            <>
              <p className="transcript__source">
                {SOURCE_LABEL[letter.transcription.source] ?? SOURCE_LABEL.ocr}
              </p>
              <div className="transcript__text">
                {letter.transcription.markdown.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </>
          ) : (
            <p className="transcript__none">This letter has not been transcribed yet. The scans above are the only record.</p>
          )}
          {letter.companions.length ? (
            <p className="transcript__files">
              Files kept with this letter:{' '}
              {letter.companions.map((c) => (
                <a key={c.id} href={c.original}>
                  {c.page}.{c.ext}
                </a>
              ))}
            </p>
          ) : null}
        </section>
      </div>

      <nav className="letter__nav" aria-label="Adjacent letters">
        {letter.previous ? (
          <Link to={`/letter/${letter.previous.key}`} rel="prev">
            ‹ Letter {letter.previous.number}
            {letter.previous.variant ?? ''}
          </Link>
        ) : (
          <span />
        )}
        {letter.next ? (
          <Link to={`/letter/${letter.next.key}`} rel="next">
            Letter {letter.next.number}
            {letter.next.variant ?? ''} ›
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  book: "From the author's book",
  translation: "The author's English translation, machine-read from his typed copy; may contain small errors",
  ocr: 'Machine-read; may contain errors',
};
