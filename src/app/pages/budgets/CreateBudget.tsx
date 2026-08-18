import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Category } from '../settings/CategoryManager';

export function CreateBudget() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiClient.get<Category[]>('/api/categories');
        // Budgets are only for expenses
        setCategories(data.filter(cat => cat.type === 'expense'));
      } catch (err) {
        console.error('Failed to fetch categories for budget creation:', err);
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
      setError('Budget amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/api/budgets', {
        category: formData.category,
        amount: amountNum,
        period: formData.period,
      });
      navigate('/app/budgets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <Link to="/app/budgets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Budgets
      </Link>

      <h1 className="text-3xl font-bold">Create Budget</h1>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3 text-sm font-medium">Select Category</label>
            {loadingCategories ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expense categories found. Please create categories first in settings.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category._id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.category === category._id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            disabled={isSubmitting}
          />

          <div>
            <label htmlFor="period" className="block mb-2 text-sm font-medium">
              Budget Period
            </label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-input border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isSubmitting}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <h4 className="font-medium text-sm text-foreground">Budget Tips</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Start with your average spending for this category</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Adjust based on your financial goals</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Review and update budgets monthly</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.category || !formData.amount || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create Budget'}
            </Button>
            <Link to="/app/budgets" className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
