import { Link } from 'react-router';
import { TrendingUp, PiggyBank, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function Splash() {
  return (
    <Card className="text-center p-8 md:p-10 rounded-3xl border border-border/70 shadow-2xl bg-card/85 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/25 animate-float">
            <TrendingUp className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">BudgetBuddy</h1>
        <p className="text-muted-foreground text-base max-w-xs mx-auto">
          Intelligent expense tracking and budgeting made effortless
        </p>
      </div>

      <div className="space-y-4 py-8">
        <div className="flex items-start gap-4 text-left p-3.5 rounded-2xl bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-0.5 text-foreground">Smart Budgeting</h3>
            <p className="text-xs text-muted-foreground">
              Set customized category limits and receive proactive alerts.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 text-left p-3.5 rounded-2xl bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-0.5 text-foreground">Insightful Analytics</h3>
            <p className="text-xs text-muted-foreground">
              Visualize trends, month-over-month variances, and spending pies.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link to="/signup" className="block w-full">
          <Button className="w-full text-base font-medium h-11" size="lg">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        <Link to="/login" className="block w-full">
          <Button variant="ghost" className="w-full text-sm font-medium h-10" size="lg">
            Already have an account? Sign in
          </Button>
        </Link>
      </div>
    </Card>
  );
}

