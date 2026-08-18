import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, TrendingUp, TrendingDown, Edit } from 'lucide-react';
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
    // Debounce/delay fetch slightly for search query if needed, or simple query on state change
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    // Standardize date key to YYYY-MM-DD
    const dateKey = new Date(transaction.date).toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Link to="/app/transactions/import" className="hidden md:block">
            <Button variant="outline">Import CSV</Button>
          </Link>
          <Link to="/app/transactions/add">
            <Button>
              <Plus className="w-5 h-5" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'income' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('income')}
              >
                Income
              </Button>
              <Button
                variant={filterType === 'expense' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('expense')}
              >
                Expenses
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">{formatDate(date)}</h3>
                    <span className="text-sm font-medium">
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
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors group"
                      >
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
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'income' ? 'text-primary' : 'text-foreground'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
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
