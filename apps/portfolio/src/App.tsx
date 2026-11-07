import { SkipLink } from '@portfolio/ui';

export function App() {
  return (
    <>
      <SkipLink />
      <header>
        <p>Aaron McCoy</p>
      </header>
      <main id="main" tabIndex={-1}>
        <h1>Frontend engineer</h1>
        <p>Case studies are on their way.</p>
      </main>
    </>
  );
}
