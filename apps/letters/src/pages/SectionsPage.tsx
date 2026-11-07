import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link } from 'react-router';
import type { SectionsPageQuery as QueryType } from '../__generated__/SectionsPageQuery.graphql.ts';
import { fetchPolicy } from '../routes.tsx';
import { Title } from '../components/Title.tsx';

export const SectionsPageQuery = graphql`
  query SectionsPageQuery {
    sections {
      id
      key
      chapter
      title
      letterCount
    }
  }
`;

export function SectionsPage() {
  const data = useLazyLoadQuery<QueryType>(SectionsPageQuery, {}, { fetchPolicy });
  return (
    <article className="sections">
      <Title text="Contents" />
      <h1 className="sections__title">The soldiers speak for themselves</h1>
      <p className="sections__lede">
        Letters home from German soldiers and their families, 1939–1945, with the author's commentary. Each chapter
        follows one family or one man; the scans are shown beside the transcription wherever one exists.
      </p>
      <ol className="toc" aria-label="Chapters">
        {data.sections.map((s) => (
          <li key={s.id} className="toc__item">
            <Link to={`/chapter/${s.key}`} className="toc__link">
              <span className="toc__number">{s.chapter === null ? 'Intro' : `Chapter ${s.chapter}`}</span>
              <span className="toc__name">{s.title}</span>
              <span className="toc__count">
                {s.letterCount} {s.letterCount === 1 ? 'letter' : 'letters'}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
