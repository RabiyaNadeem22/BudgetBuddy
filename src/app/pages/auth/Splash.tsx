import { Link } from 'react-router';
import { TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Splash() {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">BudgetBuddy</h1>
        <p className="text-muted-foreground text-lg">
          Take control of your finances
        </p>
      </div>

      <div className="space-y-4 py-8">
        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0">
            <PiggyBank className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Smart Budgeting</h3>
            <p className="text-sm text-muted-foreground">
              Set budgets and track spending by category
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Insightful Reports</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your spending patterns and trends
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Financial Goals</h3>
            <p className="text-sm text-muted-foreground">
              Save more and reach your money goals faster
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <Link to="/signup">
          <Button className="w-full" size="lg">
            Get Started
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="ghost" className="w-full" size="lg">
            Already have an account? Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
