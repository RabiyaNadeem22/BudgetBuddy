import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface StatPeriod {
  label: string;
  year: number;
  month: number;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

interface MonthlyStatsResponse {
  groupBy: string;
  stats: StatPeriod[];
  currentPeriod: {
    label: string;
    year: number;
    month: number;
    income: number;
    expenses: number;
    netSavings: number;
    savingsRate: number;
  };
}

export function MonthlyReport() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [reportData, setReportData] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMonthlyReport = async (year: number, month: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<MonthlyStatsResponse>(
        `/api/reports/monthly-stats?groupBy=month&periods=7&year=${year}&month=${month}`
      );
      setReportData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExport = () => {
    if (!reportData) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Period,Income,Expenses,Net Savings,Savings Rate (%)", 
         ...reportData.stats.map(s => `"${s.label} ${s.year}",${s.income},${s.expenses},${s.netSavings},${s.savingsRate}`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetbuddy-monthly-report-${selectedYear}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const barChartData = reportData?.stats.map(s => ({
    month: s.label,
    income: s.income,
    expenses: s.expenses,
  })) || [];

  const currentMonthData = reportData?.currentPeriod || {
    label: '',
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monthly Report</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !reportData}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} disabled={loading}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">
              {currentMonthData.label || `${selectedMonth}/${selectedYear}`}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} disabled={loading}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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
                <p className="text-2xl font-bold text-foreground">
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
                  {currentMonthData.savingsRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses (Historical Trends)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {barChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No historical chart data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
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
                        tickFormatter={(value) => `$${value}`}
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
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="income" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Income" />
                      <Bar dataKey="expenses" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMonthData.income > 0 ? (
                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-ping" />
                  <div>
                    <p className="font-medium text-foreground">Current Savings Rate</p>
                    <p className="text-sm text-muted-foreground">
                      You saved {currentMonthData.savingsRate.toFixed(1)}% of your income this month.
                      {currentMonthData.savingsRate >= 20 
                        ? " That meets the healthy 20% savings recommendation rule of thumb!"
                        : " Try to reduce non-essential expenses to raise your savings rate above 20%."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-foreground">No income recorded</p>
                    <p className="text-sm text-muted-foreground">
                      Add salary or freelance income to start generating savings rate insights.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2" />
                <div>
                  <p className="font-medium text-foreground">Total cash flow</p>
                  <p className="text-sm text-muted-foreground">
                    Your net cash flow is {currentMonthData.netSavings >= 0 ? "positive" : "negative"} by {formatCurrency(Math.abs(currentMonthData.netSavings))} this month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
