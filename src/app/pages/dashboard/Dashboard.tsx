import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency, formatDate } from '../../lib/utils';

const balanceData = {
  total: 12450.75,
  income: 8500.00,
  expenses: 3250.50,
  change: 12.5,
};

const categoryData = [
  { name: 'Food & Dining', value: 850, color: '#4CAF50' },
  { name: 'Transportation', value: 420, color: '#3B82F6' },
  { name: 'Shopping', value: 680, color: '#F59E0B' },
  { name: 'Entertainment', value: 320, color: '#8B5CF6' },
  { name: 'Bills', value: 980, color: '#EC4899' },
];

const recentTransactions = [
  { id: 1, name: 'Whole Foods', amount: -85.50, category: 'Food & Dining', date: '2026-04-24', type: 'expense' },
  { id: 2, name: 'Salary', amount: 4500.00, category: 'Income', date: '2026-04-23', type: 'income' },
  { id: 3, name: 'Uber', amount: -22.30, category: 'Transportation', date: '2026-04-23', type: 'expense' },
  { id: 4, name: 'Netflix', amount: -15.99, category: 'Entertainment', date: '2026-04-22', type: 'expense' },
  { id: 5, name: 'Amazon', amount: -156.80, category: 'Shopping', date: '2026-04-22', type: 'expense' },
];

const budgetProgress = [
  { category: 'Food & Dining', spent: 850, budget: 1000, percentage: 85 },
  { category: 'Transportation', spent: 420, budget: 500, percentage: 84 },
  { category: 'Shopping', spent: 680, budget: 600, percentage: 113 },
];

export function Dashboard() {
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
                {Math.abs(balanceData.change)}%
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
            {budgetProgress.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{item.category}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percentage > 100 ? 'bg-destructive' :
                      item.percentage > 80 ? 'bg-yellow-500' : 'bg-primary'
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
            ))}
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
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
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
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
