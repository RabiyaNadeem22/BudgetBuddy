import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';

const categoryData = [
  { name: 'Bills', value: 1200, color: '#EC4899', percentage: 37, change: 2 },
  { name: 'Food & Dining', value: 850, color: '#4CAF50', percentage: 26, change: -5 },
  { name: 'Shopping', value: 680, color: '#F59E0B', percentage: 21, change: 8 },
  { name: 'Transportation', value: 320, color: '#3B82F6', percentage: 10, change: -2 },
  { name: 'Entertainment', value: 200, color: '#8B5CF6', percentage: 6, change: 0 },
];

const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.value, 0);

export function CategoryBreakdown() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Category Breakdown</h1>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Total Expenses */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary to-primary/80">
        <CardContent>
          <p className="text-primary-foreground/80 text-sm">Total Expenses This Month</p>
          <h2 className="text-4xl font-bold text-primary-foreground mt-1">
            {formatCurrency(totalExpenses)}
          </h2>
        </CardContent>
      </Card>

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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
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
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
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
                      <span>{Math.abs(category.change)}%</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(category.value)}</span>
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
                  {category.percentage}% of total expenses
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Transactions per Category */}
      <Card>
        <CardHeader>
          <CardTitle>Top Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryData.slice(0, 3).map((category, catIndex) => (
              <div key={catIndex}>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </h4>
                <div className="space-y-2 ml-5">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm">Rent Payment</span>
                    <span className="font-medium">{formatCurrency(category.value * 0.4)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm">Utilities</span>
                    <span className="font-medium">{formatCurrency(category.value * 0.3)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Other</span>
                    <span className="font-medium">{formatCurrency(category.value * 0.3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
