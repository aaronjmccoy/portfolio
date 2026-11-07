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
      <Title text="Letters" />
      <h1 className="sections__title">Letter Scans</h1>
      <p className="sections__lede">
        Click a chapter name to see the scans for that chapter.
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
