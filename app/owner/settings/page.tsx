import OwnerSubnav from '@/components/layout/OwnerSubnav';

const hours = [
  { day: 'Monday', hours: '09:00 - 19:00' },
  { day: 'Tuesday', hours: '09:00 - 19:00' },
  { day: 'Wednesday', hours: '09:00 - 19:00' },
  { day: 'Thursday', hours: '09:00 - 20:00' },
  { day: 'Friday', hours: '09:00 - 20:00' },
  { day: 'Saturday', hours: '10:00 - 18:00' },
  { day: 'Sunday', hours: '11:00 - 16:00' }
];

export default function OwnerSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Settings</p>
        <h1 className="text-3xl font-display text-primary">Business preferences</h1>
      </div>

      <OwnerSubnav />

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display text-primary">Business hours</h2>
        <div className="space-y-3">
          {hours.map((item) => (
            <div key={item.day} className="card-surface p-4 flex items-center justify-between">
              <span className="font-medium text-primary">{item.day}</span>
              <span className="text-sm text-charcoal/70">{item.hours}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display text-primary">Notifications</h2>
        <div className="flex items-center justify-between text-sm">
          <span>Instant booking alerts</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Daily summary email</span>
          <input type="checkbox" className="h-4 w-4 accent-primary" />
        </div>
      </div>
    </div>
  );
}
