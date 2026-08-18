import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  change: number;
}

interface BreakdownResponse {
  totalExpenses: number;
  startDate: string;
  endDate: string;
  categories: CategorySpend[];
}

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  type: string;
  date: string;
}

export function CategoryBreakdown() {
  const [data, setData] = useState<BreakdownResponse | null>(null);
  const [topTransactions, setTopTransactions] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<BreakdownResponse>('/api/reports/category-breakdown');
      setData(response);

      // For the top 3 categories, fetch the top transactions
      const topThree = response.categories.slice(0, 3);
      const txMap: Record<string, Transaction[]> = {};

      await Promise.all(
        topThree.map(async (cat) => {
          try {
            const start = response.startDate.split('T')[0];
            const end = response.endDate.split('T')[0];
            const txs = await apiClient.get<Transaction[]>(
              `/api/transactions?category=${cat.categoryId}&type=expense&startDate=${start}&endDate=${end}`
            );
            // Sort by amount descending to get top expenses
            const sorted = txs.sort((a, b) => b.amount - a.amount).slice(0, 3);
            txMap[cat.categoryId] = sorted;
          } catch (err) {
            console.error(`Failed to fetch transactions for category ${cat.name}`, err);
          }
        })
      );

      setTopTransactions(txMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category breakdown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Category,Amount,Percentage (%),MoM Change (%)", 
         ...data.categories.map(c => `"${c.name}",${c.amount},${c.percentage},${c.change}`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetbuddy-category-breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalExpenses = data?.totalExpenses || 0;
  const categoriesList = data?.categories || [];

  const pieChartData = categoriesList.map(c => ({
    name: c.name,
    value: c.amount,
    color: c.color,
    percentage: c.percentage,
  }));

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
        <h1 className="text-3xl font-bold">Category Breakdown</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Total Expenses */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary to-primary/80">
        <CardContent>
          <p className="text-primary-foreground/80 text-sm">Total Expenses This Period</p>
          <h2 className="text-4xl font-bold text-primary-foreground mt-1">
            {formatCurrency(totalExpenses)}
          </h2>
        </CardContent>
      </Card>

      {categoriesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl">
          No expenses recorded in this period. Add transactions to see breakdown.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
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
            </CardContent>
          </Card>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoriesList.map((category) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 text-xs ${
                        category.change > 0 ? 'text-destructive' :
                        category.change < 0 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {category.change !== 0 && (
                          category.change > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )
                        )}
                        <span>{Math.abs(category.change).toFixed(0)}% MoM</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(category.amount)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(1)}% of total expenses
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Transactions per Category */}
      {categoriesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoriesList.slice(0, 3).map((category) => {
                const txs = topTransactions[category.categoryId] || [];
                return (
                  <div key={category.categoryId}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </h4>
                    <div className="space-y-2 ml-5">
                      {txs.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No recent transactions.</p>
                      ) : (
                        txs.map((tx) => (
                          <div key={tx._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm text-foreground">{tx.name}</span>
                            <span className="font-medium text-foreground">{formatCurrency(tx.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
