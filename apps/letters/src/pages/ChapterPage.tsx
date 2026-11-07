import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { Link, useParams } from 'react-router';
import type { ChapterPageQuery as QueryType } from '../__generated__/ChapterPageQuery.graphql.ts';
import type { ChapterPage_letters$key } from '../__generated__/ChapterPage_letters.graphql.ts';
import { fetchPolicy } from '../routes.tsx';
import { Title } from '../components/Title.tsx';
import { NotFound } from '../components/NotFound.tsx';

export const ChapterPageQuery = graphql`
  query ChapterPageQuery($key: String!, $first: Int!, $after: String) {
    section(key: $key) {
      id
      chapter
      title
      letterCount
      ...ChapterPage_letters @arguments(first: $first, after: $after)
    }
  }
`;

const LettersFragment = graphql`
  fragment ChapterPage_letters on Section
  @refetchable(queryName: "ChapterPageLettersPaginationQuery")
  @argumentDefinitions(first: { type: "Int!" }, after: { type: "String" }) {
    letters(first: $first, after: $after) @connection(key: "ChapterPage_letters") {
      edges {
        node {
          id
          key
          number
          variant
          group
          pageCount
          transcription {
            source
          }
        }
      }
    }
  }
`;

export function ChapterPage() {
  const { key = '' } = useParams();
  const data = useLazyLoadQuery<QueryType>(ChapterPageQuery, { key, first: 50 }, { fetchPolicy });
  if (!data.section) return <NotFound what="chapter" />;
  const heading = data.section.chapter === null ? data.section.title : `Chapter ${data.section.chapter}: ${data.section.title}`;
  return (
    <article className="chapter">
      <Title text={heading} />
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/letters">Letters</Link>
      </nav>
      <h1 className="chapter__title">{heading}</h1>
      <p className="chapter__count">{data.section.letterCount} letters</p>
      <LetterList section={data.section} />
    </article>
  );
}

function LetterList({ section }: { section: ChapterPage_letters$key }) {
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment(LettersFragment, section);
  return (
    <>
      <ol className="letters" aria-label="Letters in this chapter">
        {data.letters.edges.map((e) =>
          e?.node ? (
            <li key={e.node.id} className="letters__item">
              <Link to={`/letter/${e.node.key}`} className="letters__link">
                <span className="letters__number">
                  Letter {e.node.number}
                  {e.node.variant ?? ''}
                </span>
                {e.node.group ? <span className="letters__group">{e.node.group}</span> : null}
                <span className="letters__meta">
                  {e.node.pageCount} {e.node.pageCount === 1 ? 'page' : 'pages'}
                  {e.node.transcription ? ' · transcribed' : ''}
                </span>
              </Link>
            </li>
          ) : null,
        )}
      </ol>
      {hasNext ? (
        <p className="letters__more">
          <button type="button" className="button" onClick={() => loadNext(50)} disabled={isLoadingNext} aria-busy={isLoadingNext}>
            {isLoadingNext ? 'Loading…' : 'Show more letters'}
          </button>
        </p>
      ) : null}
    </>
  );
}
