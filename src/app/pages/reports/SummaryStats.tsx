import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface ExpenseMonth {
  month: string;
  year: number;
  amount: number;
}

interface SummaryResponse {
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  savingsRate: number;
  biggestExpenseCategory: { name: string; amount: number } | null;
  biggestTransaction: { name: string; amount: number; date: string } | null;
  totalTransactions: number;
  expensesByMonth: ExpenseMonth[];
  expenseTrend: {
    direction: 'decreased' | 'increased';
    percentChange: number;
    monthsCompared: number;
  };
  savingsGoal: {
    target: number;
    current: number;
    percentage: number;
    monthsToGoal: number | null;
  };
  financialHealth: {
    savingsRate: number;
    message: string;
  };
}

export function SummaryStats() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [months, setMonths] = useState(4); // Default to 4 months average
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async (numMonths: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<SummaryResponse>(`/api/reports/summary-stats?months=${numMonths}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(months);
  }, [months]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Metric,Value",
         `"Avg. Monthly Income",${data.averageMonthlyIncome}`,
         `"Avg. Monthly Expenses",${data.averageMonthlyExpenses}`,
         `"Avg. Monthly Savings",${data.averageMonthlySavings}`,
         `"Savings Rate (%)",${data.savingsRate}`,
         `"Biggest Expense Category",${data.biggestExpenseCategory?.name || 'N/A'}`,
         `"Largest Transaction",${data.biggestTransaction?.name || 'N/A'}`,
         `"Total Transactions (Month)",${data.totalTransactions}`,
         `"Savings Goal Target",${data.savingsGoal.target}`,
         `"Savings Goal Current",${data.savingsGoal.current}`
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetbuddy-summary-statistics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const maxExpenseAmount = Math.max(...data.expensesByMonth.map(m => m.amount), 1);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Summary Statistics</h1>
        <div className="flex gap-2 items-center">
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border-2 border-border text-foreground bg-background text-sm"
          >
            <option value={3}>Last 3 Months</option>
            <option value={4}>Last 4 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Monthly Income</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(data.averageMonthlyIncome)}
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
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(data.averageMonthlyExpenses)}
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
                  {formatCurrency(data.averageMonthlySavings)}
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
                  {data.savingsRate.toFixed(1)}%
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
                  {formatCurrency(data.savingsGoal.current)}
                </h3>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  of {formatCurrency(data.savingsGoal.target)} goal
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-foreground">
                  {data.savingsGoal.percentage.toFixed(1)}%
                </div>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {data.savingsGoal.monthsToGoal !== null 
                    ? data.savingsGoal.monthsToGoal === 0 
                      ? "Goal fully achieved!" 
                      : `${data.savingsGoal.monthsToGoal} months to go at this rate` 
                    : "No savings progress recorded"}
                </p>
              </div>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground rounded-full transition-all"
                style={{ width: `${data.savingsGoal.percentage}%` }}
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
                data.expenseTrend.direction === 'decreased' ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                {data.expenseTrend.direction === 'decreased' ? (
                  <TrendingDown className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {data.expenseTrend.direction === 'decreased' ? 'Expenses Decreased' : 'Expenses Increased'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your expenses {data.expenseTrend.direction} by {Math.abs(data.expenseTrend.percentChange).toFixed(1)}% over the comparison period
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Monthly Expense Trend</p>
                {data.expensesByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{month.month} {month.year}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(month.amount / maxExpenseAmount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium w-20 text-right text-foreground">
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
              {data.biggestExpenseCategory ? (
                <>
                  <p className="text-xl font-bold text-foreground">{data.biggestExpenseCategory.name}</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(data.biggestExpenseCategory.amount)} spent this month
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No expense transactions recorded.</p>
              )}
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Largest Transaction</p>
              {data.biggestTransaction ? (
                <>
                  <p className="text-xl font-bold text-foreground">{data.biggestTransaction.name}</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(data.biggestTransaction.amount)} on {data.biggestTransaction.date}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No transaction records.</p>
              )}
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-xl font-bold text-foreground">{data.totalTransactions}</p>
              <p className="text-sm font-medium text-muted-foreground">
                Recorded this month
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl">
              <p className="text-sm font-medium text-primary mb-1">Financial Health Recommendation</p>
              <p className="text-sm text-muted-foreground">
                {data.financialHealth.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
