import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@stores/queryClient';
import { RouterProvider } from 'react-router-dom';
import AppRoutes from '@route/AppRoutes';

const enableMocking = async () => {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return;
  }

  const mockWorkerPath = '/src/mocks/browsers.ts';
  const { worker } = await import(/* @vite-ignore */ mockWorkerPath);
  await worker.start();
};

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={AppRoutes()} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
