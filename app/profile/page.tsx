'use client';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Profile</p>
        <h1 className="text-3xl font-display text-primary">Your details</h1>
      </div>

      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Jordan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Lee" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jordan@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="(555) 555-0100" />
          </div>
        </div>

        <div className="card-surface p-5 space-y-3">
          <p className="text-sm font-medium text-primary">Preferences</p>
          <div className="flex items-center justify-between text-sm">
            <span>Appointment reminders</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>New studio openings</span>
            <input type="checkbox" className="h-4 w-4 accent-primary" />
          </div>
        </div>

        <Button className="w-full sm:w-auto">Save changes</Button>
      </div>
    </div>
  );
}
