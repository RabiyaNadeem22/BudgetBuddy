import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatDate } from '../../lib/utils';
import { apiClient } from '../../lib/apiClient';

interface Category {
  _id: string;
  name: string;
  color: string;
  type: string;
}

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
}

interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  balanceChange: number;
  recentTransactions: Transaction[];
}

interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface BreakdownResponse {
  totalExpenses: number;
  categories: CategorySpend[];
}

interface Budget {
  _id: string;
  category: Category;
  budget: number;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'over';
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [summaryRes, breakdownRes, budgetsRes] = await Promise.all([
          apiClient.get<DashboardSummary>('/api/reports/dashboard-summary?limit=5'),
          apiClient.get<BreakdownResponse>('/api/reports/category-breakdown'),
          apiClient.get<Budget[]>('/api/budgets'),
        ]);

        setSummary(summaryRes);
        setCategoryData(
          breakdownRes.categories.map((cat) => ({
            name: cat.name,
            value: cat.amount,
            color: cat.color,
          }))
        );
        setBudgetProgress(budgetsRes.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const balanceData = {
    total: summary?.currentBalance ?? 0,
    income: summary?.totalIncome ?? 0,
    expenses: summary?.totalExpense ?? 0,
    change: summary?.balanceChange ?? 0,
  };

  const recentTransactions = summary?.recentTransactions ?? [];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/app/transactions/add">
          <Button>
            <Plus className="w-5 h-5" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Balance Card */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary to-primary/80">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Balance</p>
              <h2 className="text-4xl font-bold text-primary-foreground mt-1">
                {formatCurrency(balanceData.total)}
              </h2>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              balanceData.change >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {balanceData.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span className="text-sm text-primary-foreground font-medium">
                {Math.abs(balanceData.change).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex gap-6 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-primary-foreground/80 text-sm">Income</p>
              <p className="text-xl font-semibold text-primary-foreground">
                {formatCurrency(balanceData.income)}
              </p>
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Expenses</p>
              <p className="text-xl font-semibold text-primary-foreground">
                {formatCurrency(balanceData.expenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center px-4">
                <p>No expenses this month yet.</p>
                <Link to="/app/transactions/add" className="text-primary text-sm mt-2 hover:underline">
                  Add your first transaction
                </Link>
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budget Progress</CardTitle>
            <Link to="/app/budgets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No budgets set up yet.</p>
                <Link to="/app/budgets/create">
                  <Button variant="outline" size="sm" className="mt-3">
                    Create a Budget
                  </Button>
                </Link>
              </div>
            ) : (
              budgetProgress.map((item) => (
                <div key={item._id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{item.category.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === 'over' ? 'bg-destructive' :
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  {item.percentage > 100 && (
                    <p className="text-xs text-destructive mt-1">
                      {item.percentage - 100}% over budget
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link to="/app/transactions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet.</p>
              <Link to="/app/transactions/add">
                <Button variant="outline" size="sm" className="mt-3">
                  Add Transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-primary" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-primary' : 'text-foreground'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
