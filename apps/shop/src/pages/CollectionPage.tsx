import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { useParams } from 'react-router';
import { Button } from '@portfolio/ui';
import type { CollectionPageQuery as QueryType } from '../__generated__/CollectionPageQuery.graphql.ts';
import type { CollectionPage_products$key } from '../__generated__/CollectionPage_products.graphql.ts';
import { NotFound } from '../components/NotFound.tsx';
import { Mosaic } from '../components/Mosaic.tsx';
import { Title } from '../components/Title.tsx';
import { fetchPolicy } from '../relay/environment.ts';

export const COLLECTION_PAGE_SIZE = 24;

export const CollectionPageQuery = graphql`
  query CollectionPageQuery($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      description
      ...CollectionPage_products @arguments(first: $first, after: $after)
    }
  }
`;

const ProductsFragment = graphql`
  fragment CollectionPage_products on Collection
  @refetchable(queryName: "CollectionPageProductsPaginationQuery")
  @argumentDefinitions(first: { type: "Int!" }, after: { type: "String" }) {
    products(first: $first, after: $after) @connection(key: "CollectionPage_products") {
      edges {
        node {
          id
          ...Mosaic_products
        }
      }
    }
  }
`;

export function CollectionPage() {
  const { handle = '' } = useParams();
  const data = useLazyLoadQuery<QueryType>(CollectionPageQuery, { handle, first: COLLECTION_PAGE_SIZE }, { fetchPolicy });
  if (!data.collection) return <NotFound what="collection" />;
  return (
    <section className="collection collection--page" aria-labelledby="collection-title">
      <Title text={data.collection.title} />
      <div className="collection__rail">
        <h1 className="rail__title" id="collection-title">
          {data.collection.title}
        </h1>
        {data.collection.description ? <p className="rail__tagline">{data.collection.description}</p> : null}
      </div>
      <Products collection={data.collection} />
    </section>
  );
}

function Products({ collection }: { collection: CollectionPage_products$key }) {
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment(ProductsFragment, collection);
  const edges = data.products.edges;
  if (edges.length === 0) return <p className="collection__empty">Nothing here yet.</p>;
  return (
    <div className="collection__body">
      <Mosaic products={edges.flatMap((e) => (e?.node ? [e.node] : []))} headingLevel={2} priorityCount={3} />
      {hasNext ? (
        <p className="collection__more">
          <Button variant="secondary" onClick={() => loadNext(COLLECTION_PAGE_SIZE)} busy={isLoadingNext}>
            {isLoadingNext ? 'Loading…' : 'Show more'}
          </Button>
        </p>
      ) : null}
    </div>
  );
}
