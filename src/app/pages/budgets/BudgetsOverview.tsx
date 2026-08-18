import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, AlertCircle, TrendingUp, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { apiClient } from '../../lib/apiClient';

interface Category {
  _id: string;
  name: string;
  color: string;
  type: string;
}

interface Budget {
  _id: string;
  category: Category;
  budget: number;
  period: string;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'over';
}

export function BudgetsOverview() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Budget[]>('/api/budgets');
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this budget limit?')) {
      return;
    }
    try {
      await apiClient.delete(`/api/budgets/${id}`);
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete budget limit');
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overBudgetCount = budgets.filter(b => b.percentage > 100).length;
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.percentage <= 100).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Link to="/app/budgets/create">
          <Button>
            <Plus className="w-5 h-5" />
            Create Budget
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary to-primary/80">
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Budget This Month</p>
              <h2 className="text-4xl font-bold text-primary-foreground mt-1">
                {formatCurrency(totalBudget)}
              </h2>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/80 text-sm">Spent</p>
                <p className="text-xl font-semibold text-primary-foreground">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-primary-foreground/80 text-sm">Remaining</p>
                <p className="text-xl font-semibold text-primary-foreground">
                  {formatCurrency(Math.max(0, totalBudget - totalSpent))}
                </p>
              </div>
              <div>
                <p className="text-primary-foreground/80 text-sm">Used</p>
                <p className="text-xl font-semibold text-primary-foreground">
                  {overallPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(overBudgetCount > 0 || warningCount > 0) && (
        <div className="space-y-3">
          {overBudgetCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Over Budget Alert</p>
                <p className="text-sm text-muted-foreground">
                  {overBudgetCount} {overBudgetCount === 1 ? 'category is' : 'categories are'} over budget this month
                </p>
              </div>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-500">Budget Warning</p>
                <p className="text-sm text-muted-foreground">
                  {warningCount} {warningCount === 1 ? 'category has' : 'categories have'} reached 80% or more of the budget
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl">
            No budget limits set. Click Create Budget to set up category spending controls.
          </div>
        ) : (
          budgets.map((budget) => (
            <Card key={budget._id}>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.category?.color || '#94A3B8' }}
                      />
                      <div>
                        <h3 className="font-semibold">{budget.category?.name || 'Unknown Category'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)} ({budget.period})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          budget.percentage > 100 ? 'text-destructive' :
                          budget.percentage >= 80 ? 'text-yellow-500' : 'text-primary'
                        }`}>
                          {budget.percentage}%
                        </p>
                        {budget.percentage > 100 && (
                          <p className="text-xs text-destructive">
                            {formatCurrency(budget.spent - budget.budget)} over
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.percentage > 100 ? 'bg-destructive' :
                        budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  {budget.percentage < 80 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>{formatCurrency(Math.max(0, budget.budget - budget.spent))} remaining</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
