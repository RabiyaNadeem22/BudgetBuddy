import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const budgets = [
  {
    id: 1,
    category: 'Food & Dining',
    spent: 850,
    budget: 1000,
    percentage: 85,
    color: '#4CAF50',
    status: 'good'
  },
  {
    id: 2,
    category: 'Transportation',
    spent: 420,
    budget: 500,
    percentage: 84,
    color: '#3B82F6',
    status: 'good'
  },
  {
    id: 3,
    category: 'Shopping',
    spent: 680,
    budget: 600,
    percentage: 113,
    color: '#F59E0B',
    status: 'over'
  },
  {
    id: 4,
    category: 'Entertainment',
    spent: 320,
    budget: 400,
    percentage: 80,
    color: '#8B5CF6',
    status: 'good'
  },
  {
    id: 5,
    category: 'Bills',
    spent: 1200,
    budget: 1200,
    percentage: 100,
    color: '#EC4899',
    status: 'warning'
  },
];

const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
const overallPercentage = (totalSpent / totalBudget) * 100;

export function BudgetsOverview() {
  const overBudgetCount = budgets.filter(b => b.percentage > 100).length;
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.percentage <= 100).length;

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
                  {formatCurrency(totalBudget - totalSpent)}
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
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h3 className="font-semibold">{budget.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}
                      </p>
                    </div>
                  </div>
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
                    <span>{formatCurrency(budget.budget - budget.spent)} remaining</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
