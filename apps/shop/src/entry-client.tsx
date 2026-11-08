import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App.tsx';
import { readCartCookie } from './cart/cookie.ts';
import { createEnvironment, httpFetch, readServerRecords } from './relay/environment.ts';

const environment = createEnvironment(httpFetch, readServerRecords());

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <App environment={environment} cartId={readCartCookie(document.cookie)} />
    </BrowserRouter>
  </StrictMode>,
);
