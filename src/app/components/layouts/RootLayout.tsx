import { Outlet } from 'react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export function RootLayout() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
      <Outlet />
      <Toaster richColors position="top-right" theme="dark" closeButton />
    </div>
  );
}

