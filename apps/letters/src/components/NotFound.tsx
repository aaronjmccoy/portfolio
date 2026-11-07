import { Link } from 'react-router';
import { Title } from './Title.tsx';

export function NotFound({ what }: { what: string }) {
  return (
    <article className="notfound">
      <Title text="Not found" />
      <h1>No such {what}</h1>
      <p>
        Nothing in the archive matches that address. <Link to="/letters">Back to the letters</Link> or{' '}
        <Link to="/">the home page</Link>.
      </p>
    </article>
  );
}
