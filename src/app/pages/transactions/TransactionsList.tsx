import { Link } from 'react-router';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

const mockTransactions = [
  { id: 1, name: 'Salary - April', amount: 4500.00, category: 'Income', date: '2026-04-23', type: 'income', notes: 'Monthly salary' },
  { id: 2, name: 'Whole Foods', amount: -85.50, category: 'Food & Dining', date: '2026-04-24', type: 'expense', notes: 'Weekly groceries' },
  { id: 3, name: 'Uber', amount: -22.30, category: 'Transportation', date: '2026-04-23', type: 'expense', notes: 'Ride to office' },
  { id: 4, name: 'Netflix', amount: -15.99, category: 'Entertainment', date: '2026-04-22', type: 'expense', notes: 'Monthly subscription' },
  { id: 5, name: 'Amazon', amount: -156.80, category: 'Shopping', date: '2026-04-22', type: 'expense', notes: 'Electronics' },
  { id: 6, name: 'Freelance Project', amount: 800.00, category: 'Income', date: '2026-04-20', type: 'income', notes: 'Website redesign' },
  { id: 7, name: 'Starbucks', amount: -8.50, category: 'Food & Dining', date: '2026-04-20', type: 'expense', notes: 'Coffee' },
  { id: 8, name: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2026-04-19', type: 'expense', notes: 'Fuel' },
  { id: 9, name: 'Rent', amount: -1200.00, category: 'Bills', date: '2026-04-15', type: 'expense', notes: 'Monthly rent' },
  { id: 10, name: 'Electricity Bill', amount: -78.50, category: 'Bills', date: '2026-04-14', type: 'expense', notes: 'Monthly bill' },
];

export function TransactionsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof mockTransactions>);

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

          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">{formatDate(date)}</h3>
                  <span className="text-sm font-medium">
                    {formatCurrency(
                      transactions.reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      to={`/app/transactions/edit/${transaction.id}`}
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
                          <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-primary' : 'text-foreground'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
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
        </div>
      </Card>
    </div>
  );
}
