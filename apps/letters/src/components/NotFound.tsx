import { Link } from 'react-router';
import { Title } from './Title.tsx';

export function NotFound({ what }: { what: string }) {
  return (
    <article className="notfound">
      <Title text="Not found" />
      <h1>No such {what}</h1>
      <p>
        Nothing in the archive matches that address. <Link to="/">Back to the contents</Link>.
      </p>
    </article>
  );
}
