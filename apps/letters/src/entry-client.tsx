import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App.tsx';
import { createEnvironment, httpFetch, readServerRecords } from './relay/environment.ts';

const environment = createEnvironment(httpFetch, readServerRecords());

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <App environment={environment} />
    </BrowserRouter>
  </StrictMode>,
);
