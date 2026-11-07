import { SkipLink } from '@portfolio/ui';

export type AppProps = { url: string };

export function App({ url }: AppProps) {
  return (
    <>
      <SkipLink />
      <header>
        <p>German War Letters, 1939–1945</p>
      </header>
      <main id="main" tabIndex={-1}>
        <h1>The soldiers speak for themselves</h1>
        <p>Rendered for {url}.</p>
      </main>
    </>
  );
}
