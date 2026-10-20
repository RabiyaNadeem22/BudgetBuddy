import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, clearCredentials } from '../../store/slices/authSlice';
import { apiClient } from '../../lib/apiClient';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Transactions', href: '/app/transactions', icon: Receipt },
  { name: 'Budgets', href: '/app/budgets', icon: PiggyBank },
  { name: 'Reports', href: '/app/reports/monthly', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings/profile', icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }

    if (isAuthenticated && token && !user) {
      apiClient.get<{ _id: string; name: string; email: string }>('/api/users/profile')
        .then((res) => {
          dispatch(setUser({ id: res._id, name: res.name, email: res.email }));
        })
        .catch((err) => {
          console.error('Failed to load user profile:', err);
          localStorage.removeItem('token');
          dispatch(clearCredentials());
          navigate('/login', { replace: true });
        });
    }
  }, [isAuthenticated, token, user, navigate, dispatch]);

  if (!isAuthenticated || !token) {
    return null;
  }

  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground animate-pulse">Loading secure profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar — fixed, full height, never scrolls */}
      <aside className="hidden md:flex md:flex-col fixed top-0 left-0 h-screen w-64 bg-card/80 backdrop-blur-md border-r border-border/70 select-none z-30">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-md shadow-primary/20">
            <PiggyBank className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">BudgetBuddy</h1>
            <p className="text-xs text-muted-foreground font-medium">Smart Finance Tracker</p>
          </div>
        </div>

        {/* Nav links — scrollable if ever needed */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/app' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center shrink-0 text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                dispatch(clearCredentials());
                navigate('/login', { replace: true });
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/80">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-xs">
              <PiggyBank className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">BudgetBuddy</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-border/70 p-4 space-y-1.5 bg-card/95 backdrop-blur-lg animate-fadeIn">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/app' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-border/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  localStorage.removeItem('token');
                  dispatch(clearCredentials());
                  navigate('/login', { replace: true });
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Main Content — offset by sidebar width on desktop */}
      <main className="flex-1 overflow-auto pt-16 pb-24 md:pt-0 md:pb-8 md:ml-64">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border/80">
        <nav className="grid grid-cols-5 p-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/app' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight truncate max-w-full">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
