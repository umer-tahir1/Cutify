import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { CartSidebar } from './components/CartSidebar';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <CartSidebar />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
