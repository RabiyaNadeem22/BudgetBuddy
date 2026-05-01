import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Plus, Receipt, PiggyBank, Upload } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Receipt className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Welcome to BudgetBuddy!</h1>
        <p className="text-muted-foreground text-lg">
          Get started by adding your first transaction or setting up a budget
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/app/transactions/add" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add Transaction</h3>
                <p className="text-sm text-muted-foreground">
                  Record your income or expense
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/app/budgets/create" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Set spending limits by category
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/app/transactions/import" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload transactions from CSV
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="bg-muted/50 border-dashed">
        <div className="space-y-2">
          <h3 className="font-semibold">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Start by adding your regular income and expenses</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Set realistic budgets for each spending category</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Review your reports monthly to identify trends</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Import your bank statements for faster setup</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
