import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, setLoading } from '../../store/slices/authSlice';
import { loginUser } from '../../lib/authApi';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      dispatch(
        setCredentials({
          user: { id: response._id, name: response.name, email: response.email },
          token: response.token,
        })
      );
      localStorage.setItem('token', response.token);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="p-8 md:p-10 rounded-3xl border border-border/70 shadow-2xl bg-card/85 backdrop-blur-xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your BudgetBuddy account</p>
      </div>

      {error ? (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fadeIn">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="text-right pt-1">
            <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2 h-10" size="lg" disabled={isSubmitting}>
          <LogIn className="w-4 h-4" />
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Card>
  );
}

