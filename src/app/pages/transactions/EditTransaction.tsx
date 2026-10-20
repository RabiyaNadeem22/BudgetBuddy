import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Category } from '../settings/CategoryManager';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // ID string
  date: string;
  notes?: string;
}

export function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    name: '',
    date: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch transaction and categories list
        const [transactionData, categoriesData] = await Promise.all([
          apiClient.get<any>(`/api/transactions/${id}`),
          apiClient.get<Category[]>('/api/categories'),
        ]);

        setCategories(categoriesData);

        // Populate form data
        setFormData({
          type: transactionData.type,
          amount: String(transactionData.amount),
          category: transactionData.category?._id || transactionData.category || '',
          name: transactionData.name,
          date: new Date(transactionData.date).toISOString().split('T')[0],
          notes: transactionData.notes || '',
        });
      } catch (err) {
        console.error('Failed to load transaction data:', err);
        setError('Failed to load transaction details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
      await apiClient.put(`/api/transactions/${id}`, {
        name: formData.name,
        amount: amountNum,
        type: formData.type,
        category: formData.category,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes,
      });
      toast.success('Transaction updated successfully!');
      navigate('/app/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/transactions/${id}`);
      toast.success('Transaction deleted');
      navigate('/app/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/app/transactions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Transactions
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Edit Transaction</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Modify transaction details</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSubmitting}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </Button>
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
            placeholder="e.g., Grocery shopping, Utilities"
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
              className="flex h-10 w-full rounded-lg border border-input bg-input-background px-3.5 py-2 text-sm text-foreground transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
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
              className="flex w-full rounded-lg border border-input bg-input-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1 h-10" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link to="/app/transactions" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-10" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="max-w-md w-full p-6 shadow-2xl border border-border/80">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Delete Transaction?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="destructive"
                  className="flex-1 h-10"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
