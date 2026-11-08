import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSearchParams } from 'react-router';
import type { SearchPageQuery as QueryType } from '../__generated__/SearchPageQuery.graphql.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Title } from '../components/Title.tsx';
import { fetchPolicy } from '../relay/environment.ts';

export const SEARCH_PAGE_SIZE = 24;

export const SearchPageQuery = graphql`
  query SearchPageQuery($q: String!, $first: Int!) {
    search(query: $q, first: $first, types: [PRODUCT]) {
      totalCount
      edges {
        node {
          ... on Product @alias(as: "product") {
            id
            ...ProductCard_product
          }
        }
      }
    }
  }
`;

/** Full search results; the header's pill submits here, and so does the form below when JavaScript is off. */
export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  return (
    <section className="search-page" aria-labelledby="search-title">
      <Title text={q ? `Search: ${q}` : 'Search'} />
      <h1 className="rail__title" id="search-title">
        {q ? <>Results for “{q}”</> : 'Search'}
      </h1>
      {q ? <Results q={q} /> : <p className="rail__tagline">Type a title or a word from a caption in the search box above.</p>}
    </section>
  );
}

function Results({ q }: { q: string }) {
  const data = useLazyLoadQuery<QueryType>(SearchPageQuery, { q, first: SEARCH_PAGE_SIZE }, { fetchPolicy });
  const items = data.search.edges.flatMap((e) => (e.node.product ? [e.node.product] : []));
  const total = data.search.totalCount;
  return (
    <>
      <p className="rail__tagline" role="status">
        {total === 0 ? 'Nothing matched.' : `${total} ${total === 1 ? 'result' : 'results'}`}
      </p>
      {items.length ? (
        <div className="collection__grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} headingLevel={2} />
          ))}
        </div>
      ) : null}
    </>
  );
}
