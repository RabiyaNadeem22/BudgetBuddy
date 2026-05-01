import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { DashboardLayout } from "./components/layouts/DashboardLayout";

// Auth screens
import { Splash } from "./pages/auth/Splash";
import { Signup } from "./pages/auth/Signup";
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";

// Dashboard screens
import { Dashboard } from "./pages/dashboard/Dashboard";
import { EmptyState } from "./pages/dashboard/EmptyState";

// Transaction screens
import { TransactionsList } from "./pages/transactions/TransactionsList";
import { AddTransaction } from "./pages/transactions/AddTransaction";
import { EditTransaction } from "./pages/transactions/EditTransaction";
import { ImportCSV } from "./pages/transactions/ImportCSV";

// Budget screens
import { BudgetsOverview } from "./pages/budgets/BudgetsOverview";
import { CreateBudget } from "./pages/budgets/CreateBudget";

// Report screens
import { MonthlyReport } from "./pages/reports/MonthlyReport";
import { CategoryBreakdown } from "./pages/reports/CategoryBreakdown";
import { SummaryStats } from "./pages/reports/SummaryStats";

// Settings screens
import { ProfileSettings } from "./pages/settings/ProfileSettings";
import { CategoryManager } from "./pages/settings/CategoryManager";
import { NotificationSettings } from "./pages/settings/NotificationSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: AuthLayout,
        children: [
          { index: true, Component: Splash },
          { path: "signup", Component: Signup },
          { path: "login", Component: Login },
          { path: "forgot-password", Component: ForgotPassword },
        ],
      },
      {
        path: "/app",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "empty", Component: EmptyState },
          { path: "transactions", Component: TransactionsList },
          { path: "transactions/add", Component: AddTransaction },
          { path: "transactions/edit/:id", Component: EditTransaction },
          { path: "transactions/import", Component: ImportCSV },
          { path: "budgets", Component: BudgetsOverview },
          { path: "budgets/create", Component: CreateBudget },
          { path: "reports/monthly", Component: MonthlyReport },
          { path: "reports/category", Component: CategoryBreakdown },
          { path: "reports/summary", Component: SummaryStats },
          { path: "settings/profile", Component: ProfileSettings },
          { path: "settings/categories", Component: CategoryManager },
          { path: "settings/notifications", Component: NotificationSettings },
        ],
      },
    ],
  },
]);
