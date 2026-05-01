import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { useState } from 'react';

const monthlyData = [
  { month: 'Oct', income: 4800, expenses: 3200 },
  { month: 'Nov', income: 5200, expenses: 3800 },
  { month: 'Dec', income: 4500, expenses: 4200 },
  { month: 'Jan', income: 5000, expenses: 3500 },
  { month: 'Feb', income: 4700, expenses: 3300 },
  { month: 'Mar', income: 5100, expenses: 3600 },
  { month: 'Apr', income: 5300, expenses: 3250 },
];

const currentMonthData = {
  month: 'April 2026',
  income: 5300,
  expenses: 3250,
  netSavings: 2050,
  savingsRate: 38.7,
};

export function MonthlyReport() {
  const [currentMonth] = useState('April 2026');

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monthly Report</h1>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">{currentMonth}</h2>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(currentMonthData.income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-2xl font-bold">
              {formatCurrency(currentMonthData.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">Net Savings</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(currentMonthData.netSavings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
            <p className="text-2xl font-bold text-primary">
              {currentMonthData.savingsRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses (Last 7 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'rgba(76, 175, 80, 0.1)' }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                <Bar dataKey="income" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="font-medium">Great savings this month!</p>
              <p className="text-sm text-muted-foreground">
                You saved {currentMonthData.savingsRate}% of your income, which is above your average of 32%.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
            <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2" />
            <div>
              <p className="font-medium">Spending trend</p>
              <p className="text-sm text-muted-foreground">
                Your expenses decreased by 15% compared to last month.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
            <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2" />
            <div>
              <p className="font-medium">Top spending category</p>
              <p className="text-sm text-muted-foreground">
                Bills accounted for 37% of your total expenses this month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
