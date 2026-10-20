import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Search, TrendingUp, TrendingDown, Edit, ArrowUpRight, Receipt } from 'lucide-react';
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
  notes?: string;
}

export function TransactionsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let path = '/api/transactions';
      const params = new URLSearchParams();

      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const queryString = params.toString();
      if (queryString) {
        path += `?${queryString}`;
      }

      const data = await apiClient.get<Transaction[]>(path);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateKey = new Date(transaction.date).toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and review your activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/transactions/import">
            <Button variant="outline" size="sm" className="h-9">Import CSV</Button>
          </Link>
          <Link to="/app/transactions/add">
            <Button size="sm" className="h-9">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl">
          {error}
        </div>
      )}

      <Card className="p-5 md:p-6 shadow-sm border border-border/70">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search transactions by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40 shrink-0 self-start sm:self-auto">
              <Button
                variant={filterType === 'all' ? 'primary' : 'ghost'}
                size="sm"
                className="h-8 text-xs font-medium px-3 rounded-lg"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'income' ? 'primary' : 'ghost'}
                size="sm"
                className="h-8 text-xs font-medium px-3 rounded-lg"
                onClick={() => setFilterType('income')}
              >
                Income
              </Button>
              <Button
                variant={filterType === 'expense' ? 'primary' : 'ghost'}
                size="sm"
                className="h-8 text-xs font-medium px-3 rounded-lg"
                onClick={() => setFilterType('expense')}
              >
                Expenses
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No transactions found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery || filterType !== 'all'
                  ? 'Try clearing your filters or search term to see more results.'
                  : 'Start tracking your spending by adding your first transaction.'}
              </p>
              <Link to="/app/transactions/add" className="inline-block mt-4">
                <Button size="sm" variant="outline" className="h-9">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-border/40">
              {Object.entries(groupedTransactions).map(([date, dateTransactions], groupIndex) => (
                <div key={date} className={groupIndex > 0 ? "pt-5" : ""}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                      {formatDate(date)}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatCurrency(
                        dateTransactions.reduce((sum, t) => {
                          return sum + (t.type === 'income' ? t.amount : -t.amount);
                        }, 0)
                      )}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dateTransactions.map((transaction) => (
                      <Link
                        key={transaction._id}
                        to={`/app/transactions/edit/${transaction._id}`}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card hover:bg-muted/40 hover:border-border transition-all group shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            transaction.type === 'income'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {transaction.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {transaction.category?.color && (
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: transaction.category.color }}
                                />
                              )}
                              <p className="text-xs text-muted-foreground truncate">
                                {transaction.category?.name || 'Uncategorized'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-3 shrink-0">
                          <p className={`font-semibold text-sm ${
                            transaction.type === 'income' ? 'text-emerald-500' : 'text-foreground'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <Edit className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

