import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const stats = {
  averageMonthlyIncome: 5020,
  averageMonthlyExpenses: 3560,
  averageMonthlySavings: 1460,
  savingsRate: 29.1,
  biggestExpenseCategory: { name: 'Bills', amount: 1200 },
  biggestTransaction: { name: 'Rent Payment', amount: 1200, date: '2026-04-15' },
  totalTransactions: 156,
  expensesByMonth: [
    { month: 'Jan', amount: 3500 },
    { month: 'Feb', amount: 3300 },
    { month: 'Mar', amount: 3600 },
    { month: 'Apr', amount: 3250 },
  ],
};

const savingsGoal = {
  target: 10000,
  current: 6240,
  percentage: 62.4,
  monthsToGoal: 3,
};

export function SummaryStats() {
  const expenseTrend = stats.expensesByMonth[3].amount - stats.expensesByMonth[0].amount;
  const trendPercentage = ((expenseTrend / stats.expensesByMonth[0].amount) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Summary Statistics</h1>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Monthly Income</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.averageMonthlyIncome)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Monthly Expenses</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.averageMonthlyExpenses)}
                </p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Monthly Savings</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.averageMonthlySavings)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.savingsRate}%
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goal Progress */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary to-primary/80">
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Savings Goal Progress</p>
                <h3 className="text-3xl font-bold text-primary-foreground mt-1">
                  {formatCurrency(savingsGoal.current)}
                </h3>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  of {formatCurrency(savingsGoal.target)} goal
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-foreground">
                  {savingsGoal.percentage}%
                </div>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {savingsGoal.monthsToGoal} months to go
                </p>
              </div>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground rounded-full transition-all"
                style={{ width: `${savingsGoal.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                expenseTrend < 0 ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                {expenseTrend < 0 ? (
                  <TrendingDown className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {expenseTrend < 0 ? 'Expenses Decreased' : 'Expenses Increased'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your expenses {expenseTrend < 0 ? 'decreased' : 'increased'} by {Math.abs(Number(trendPercentage))}% over the last 4 months
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Monthly Expense Trend</p>
                {stats.expensesByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm">{month.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(month.amount / 4000) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium w-20 text-right">
                        {formatCurrency(month.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Biggest Expense Category</p>
              <p className="text-xl font-bold">{stats.biggestExpenseCategory.name}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {formatCurrency(stats.biggestExpenseCategory.amount)} this month
              </p>
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Largest Transaction</p>
              <p className="text-xl font-bold">{stats.biggestTransaction.name}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {formatCurrency(stats.biggestTransaction.amount)} on {stats.biggestTransaction.date}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-xl font-bold">{stats.totalTransactions}</p>
              <p className="text-sm font-medium text-muted-foreground">
                Recorded this month
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl">
              <p className="text-sm font-medium text-primary mb-1">Financial Health</p>
              <p className="text-sm text-muted-foreground">
                You're saving {stats.savingsRate}% of your income, which is a healthy rate. Keep it up!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
