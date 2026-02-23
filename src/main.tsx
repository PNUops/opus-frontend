import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { worker } from '@mocks/browsers';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from 'stores/queryClient';
import { RouterProvider } from 'react-router-dom';
import AppRoutes from '@route/AppRoutes';

if (process.env.NODE_ENV === 'development') {
  // await worker.start();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes()} />
    </QueryClientProvider>
  </React.StrictMode>,
);
