import { SkipLink } from '@portfolio/ui';

export type AppProps = { url: string };

export function App({ url }: AppProps) {
  return (
    <>
      <SkipLink />
      <header>
        <p>Maller Art</p>
      </header>
      <main id="main" tabIndex={-1}>
        <h1>Paintings, prints and trinkets</h1>
        <p>Rendered for {url}.</p>
      </main>
    </>
  );
}
