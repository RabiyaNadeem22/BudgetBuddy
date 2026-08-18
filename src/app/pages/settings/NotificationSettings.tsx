import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Mail, Smartphone, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

type PreferenceKey = 'budgetAlerts' | 'largeTransactions' | 'monthlySummary' | 'savingsGoals';

interface ChannelPreference {
  email: boolean;
  push: boolean;
}

interface NotificationPreferences {
  budgetAlerts: ChannelPreference;
  largeTransactions: ChannelPreference;
  monthlySummary: ChannelPreference;
  savingsGoals: ChannelPreference;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  settings: {
    notificationsEnabled: boolean;
    budgetWarningThreshold: number;
    notificationPreferences?: NotificationPreferences;
  };
}

interface NotificationSetting {
  id: string;
  preferenceKey: PreferenceKey;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  icon: React.ElementType;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  budgetAlerts: { email: true, push: true },
  largeTransactions: { email: true, push: false },
  monthlySummary: { email: true, push: false },
  savingsGoals: { email: false, push: true },
};

const buildSettingsFromPreferences = (preferences: NotificationPreferences): NotificationSetting[] => [
  {
    id: 'budget-alerts',
    preferenceKey: 'budgetAlerts',
    title: 'Budget Alerts',
    description: 'Get notified when you reach 80% or exceed your budget',
    email: preferences.budgetAlerts.email,
    push: preferences.budgetAlerts.push,
    icon: AlertCircle,
  },
  {
    id: 'large-transactions',
    preferenceKey: 'largeTransactions',
    title: 'Large Transactions',
    description: 'Alerts for transactions over $500',
    email: preferences.largeTransactions.email,
    push: preferences.largeTransactions.push,
    icon: DollarSign,
  },
  {
    id: 'monthly-summary',
    preferenceKey: 'monthlySummary',
    title: 'Monthly Summary',
    description: 'Receive a summary of your finances at the end of each month',
    email: preferences.monthlySummary.email,
    push: preferences.monthlySummary.push,
    icon: TrendingUp,
  },
  {
    id: 'savings-goals',
    preferenceKey: 'savingsGoals',
    title: 'Savings Goals',
    description: 'Updates on your progress towards savings goals',
    email: preferences.savingsGoals.email,
    push: preferences.savingsGoals.push,
    icon: TrendingUp,
  },
];

const toApiPreferences = (settings: NotificationSetting[]): NotificationPreferences => {
  const prefs = { ...DEFAULT_PREFERENCES };

  settings.forEach((setting) => {
    prefs[setting.preferenceKey] = {
      email: setting.email,
      push: setting.push,
    };
  });

  return prefs;
};

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>(
    buildSettingsFromPreferences(DEFAULT_PREFERENCES)
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const profile = await apiClient.get<UserProfile>('/api/users/profile');
        const preferences = {
          ...DEFAULT_PREFERENCES,
          ...profile.settings?.notificationPreferences,
        };

        setNotificationsEnabled(profile.settings?.notificationsEnabled ?? true);
        setSettings(buildSettingsFromPreferences(preferences));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleEmail = (id: string) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.id === id ? { ...setting, email: !setting.email } : setting
      )
    );
  };

  const togglePush = (id: string) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.id === id ? { ...setting, push: !setting.push } : setting
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const hasAnyEnabled = settings.some((setting) => setting.email || setting.push);

      await apiClient.put('/api/users/profile', {
        settings: {
          notificationsEnabled: notificationsEnabled && hasAnyEnabled,
          notificationPreferences: toApiPreferences(settings),
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive updates</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Global Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Enable notifications</p>
              <p className="text-sm text-muted-foreground">
                Master switch for all BudgetBuddy alerts and summaries
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {settings.map((setting) => {
              const Icon = setting.icon;
              const disabled = !notificationsEnabled;

              return (
                <div
                  key={setting.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border border-border ${
                    disabled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{setting.description}</p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            onChange={() => toggleEmail(setting.id)}
                            disabled={disabled}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors peer-disabled:opacity-50" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={setting.push}
                            onChange={() => togglePush(setting.id)}
                            disabled={disabled}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors peer-disabled:opacity-50" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Smartphone className="w-4 h-4" />
                          <span>Push</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent>
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">About Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Email notifications are sent to your registered email address. Push notifications
                require the BudgetBuddy mobile app and permission on your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
