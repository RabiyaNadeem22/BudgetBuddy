import { Outlet } from 'react-router';
import { useEffect } from 'react';

export function RootLayout() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
