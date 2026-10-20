import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, setLoading } from '../../store/slices/authSlice';
import { signupUser } from '../../lib/authApi';

export function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      const response = await signupUser({
        name: formData.name,
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
      setError(err instanceof Error ? err.message : 'Signup failed');
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start tracking your financial journey today</p>
      </div>

      {error ? (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fadeIn">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="space-y-1.5 text-left">
          <label htmlFor="currency" className="block text-sm font-medium text-foreground tracking-tight">
            Preferred Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-input bg-input-background px-3.5 py-2 text-sm text-foreground transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="JPY">JPY (¥) - Japanese Yen</option>
            <option value="AUD">AUD ($) - Australian Dollar</option>
          </select>
        </div>

        <Button type="submit" className="w-full mt-2 h-10" size="lg" disabled={isSubmitting}>
          <UserPlus className="w-4 h-4" />
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}

