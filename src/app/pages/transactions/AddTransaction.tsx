import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Category } from '../settings/CategoryManager';
import { toast } from 'sonner';

export function AddTransaction() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiClient.get<Category[]>('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories list.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/api/transactions', {
        name: formData.name,
        amount: amountNum,
        type: formData.type,
        category: formData.category,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes,
      });
      toast.success('Transaction added successfully!');
      navigate('/app/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/app/transactions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Transactions
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Add Transaction</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Record a new income or expense</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl animate-fadeIn">
          {error}
        </div>
      )}

      <Card className="p-6 md:p-8 shadow-sm border border-border/70">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-medium text-foreground tracking-tight">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  formData.type === 'expense'
                    ? 'border-destructive bg-destructive/10 text-destructive shadow-xs'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60'
                }`}
                disabled={isSubmitting}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  formData.type === 'income'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-xs'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60'
                }`}
                disabled={isSubmitting}
              >
                Income
              </button>
            </div>
          </div>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Description"
            type="text"
            placeholder="e.g., Grocery shopping, Monthly rent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
          />

          <div className="space-y-1.5 text-left">
            <label htmlFor="category" className="block text-sm font-medium text-foreground tracking-tight">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-input px-3.5 py-2 text-sm transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              style={{
                backgroundColor: 'var(--input-background, var(--card))',
                color: 'var(--foreground)',
              }}
              required
              disabled={loadingCategories || isSubmitting}
            >
              <option
                value=""
                style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              >
                {loadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {filteredCategories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                  style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isSubmitting}
          />

          <div className="space-y-1.5 text-left">
            <label htmlFor="notes" className="block text-sm font-medium text-foreground tracking-tight">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any additional notes or references..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex w-full rounded-lg border border-input px-3.5 py-2.5 text-sm placeholder:text-muted-foreground transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
              style={{
                backgroundColor: 'var(--input-background, var(--card))',
                color: 'var(--foreground)',
              }}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1 h-10" disabled={isSubmitting}>
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
            <Link to="/app/transactions" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-10" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

