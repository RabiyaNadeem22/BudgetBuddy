import { useNavigate, Link } from 'react-router';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';

const categories = [
  { name: 'Food & Dining', color: '#4CAF50' },
  { name: 'Transportation', color: '#3B82F6' },
  { name: 'Shopping', color: '#F59E0B' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Bills', color: '#EC4899' },
  { name: 'Healthcare', color: '#10B981' },
  { name: 'Education', color: '#06B6D4' },
  { name: 'Other', color: '#6366F1' },
];

export function CreateBudget() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/budgets');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <Link to="/app/budgets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Budgets
      </Link>

      <h1 className="text-3xl font-bold">Create Budget</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3 text-sm font-medium">Select Category</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.name })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.category === category.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
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
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <h4 className="font-medium text-sm">Budget Tips</h4>
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
            <Button type="submit" className="flex-1" disabled={!formData.category || !formData.amount}>
              Create Budget
            </Button>
            <Link to="/app/budgets" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
