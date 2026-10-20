import { Link } from 'react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiClient.post('/api/users/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 md:p-10 rounded-3xl border border-border/70 shadow-2xl bg-card/85 backdrop-blur-xl space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent password reset instructions to <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <Link to="/login" className="block w-full pt-2">
          <Button variant="outline" className="w-full h-10">
            Back to Sign In
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we'll send you a link to reset your password
        </p>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-2 h-10" size="lg" disabled={isSubmitting}>
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
        </Button>
      </form>
    </Card>
  );
}

