import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { Link } from 'react-router';
import type { HomePageQuery as QueryType } from '../__generated__/HomePageQuery.graphql.ts';
import type { HomePage_section$key } from '../__generated__/HomePage_section.graphql.ts';
import { Mosaic } from '../components/Mosaic.tsx';
import { Title } from '../components/Title.tsx';
import { fetchPolicy } from '../relay/environment.ts';
import { HERO, SECTIONS } from '../site.ts';

export const HomePageQuery = graphql`
  query HomePageQuery {
    originals: collection(handle: "originals") {
      ...HomePage_section
    }
    prints: collection(handle: "prints") {
      ...HomePage_section
    }
    stickers: collection(handle: "stickers") {
      ...HomePage_section
    }
  }
`;

const SectionFragment = graphql`
  fragment HomePage_section on Collection {
    id
    handle
    title
    description
    products(first: 8) {
      nodes {
        ...Mosaic_products
      }
    }
  }
`;

/** The one-page gallery from the mockup: hero, then each collection as a rail beside a mosaic of its pieces. */
export function HomePage() {
  const data = useLazyLoadQuery<QueryType>(HomePageQuery, {}, { fetchPolicy });
  const sections = [data.originals, data.prints, data.stickers];
  return (
    <>
      <Title />
      <figure className="hero">
        <img className="hero__media" src={HERO.src} width={HERO.width} height={HERO.height} alt={HERO.alt} fetchPriority="high" decoding="async" />
      </figure>
      {SECTIONS.map((s, i) => {
        const collection = sections[i];
        return collection ? <Section key={s.handle} collection={collection} tagline={s.tagline} /> : null;
      })}
    </>
  );
}

function Section({ collection, tagline }: { collection: HomePage_section$key; tagline: string }) {
  const c = useFragment(SectionFragment, collection);
  const headingId = `${c.handle}-title`;
  return (
    <section className="collection" id={c.handle} aria-labelledby={headingId}>
      <div className="collection__rail">
        <h2 className="rail__title" id={headingId}>
          {c.title}
        </h2>
        <p className="rail__tagline">
          <Link to={`/collections/${c.handle}`}>{c.description || tagline}</Link>
        </p>
      </div>
      {c.products.nodes.length ? (
        <Mosaic products={c.products.nodes} />
      ) : (
        <p className="collection__empty">Coming soon.</p>
      )}
    </section>
  );
}
