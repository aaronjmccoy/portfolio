import { Link } from 'react-router';
import { Title } from './Title.tsx';

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <section className="notice">
      <Title text="Not found" />
      <h1 className="notice__title">No such {what}</h1>
      <p>
        It may have sold, or the link may be old. <Link to="/">Back to the gallery</Link>.
      </p>
    </section>
  );
}
