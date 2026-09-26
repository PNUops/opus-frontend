import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@stores/queryClient';
import { RouterProvider } from 'react-router-dom';
import AppRoutes from '@route/AppRoutes';

if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
  const { worker } = await import('@mocks/browsers');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes()} />
    </QueryClientProvider>
  </React.StrictMode>,
);
