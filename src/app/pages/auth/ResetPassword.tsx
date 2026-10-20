import { Link, useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing from the URL. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.put('/api/users/reset-password', {
        token,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 md:p-10 rounded-3xl border border-border/70 shadow-2xl bg-card/85 backdrop-blur-xl space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Password Reset Successful</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. Redirecting to Sign In...
          </p>
        </div>

        <Link to="/login" className="block w-full pt-2">
          <Button className="w-full h-10">
            Go to Sign In
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 md:p-10 rounded-3xl border border-border/70 shadow-2xl bg-card/85 backdrop-blur-xl space-y-6">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Create New Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password below to regain access to your account
        </p>
      </div>

      {error ? (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fadeIn">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-2 h-10" size="lg" disabled={isSubmitting}>
          <Lock className="w-4 h-4" />
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </Card>
  );
}

