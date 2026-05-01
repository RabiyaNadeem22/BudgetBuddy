import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Mail, Smartphone, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  icon: React.ElementType;
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'budget-alerts',
      title: 'Budget Alerts',
      description: 'Get notified when you reach 80% or exceed your budget',
      email: true,
      push: true,
      icon: AlertCircle,
    },
    {
      id: 'large-transactions',
      title: 'Large Transactions',
      description: 'Alerts for transactions over $500',
      email: true,
      push: false,
      icon: DollarSign,
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary',
      description: 'Receive a summary of your finances at the end of each month',
      email: true,
      push: false,
      icon: TrendingUp,
    },
    {
      id: 'savings-goals',
      title: 'Savings Goals',
      description: 'Updates on your progress towards savings goals',
      email: false,
      push: true,
      icon: TrendingUp,
    },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleEmail = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, email: !s.email } : s
    ));
  };

  const togglePush = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, push: !s.push } : s
    ));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {settings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div
                  key={setting.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {setting.description}
                    </p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            onChange={() => toggleEmail(setting.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
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
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
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
            <Button onClick={handleSave} className="w-full">
              {saved ? 'Saved!' : 'Save Preferences'}
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
