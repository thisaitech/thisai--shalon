import { ChevronLeft, ChevronRight } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';

const appointments = [
  { time: '09:00', client: 'Morgan K.', service: 'Blowout' },
  { time: '11:30', client: 'Avery Q.', service: 'Color melt' },
  { time: '14:00', client: 'Jamie S.', service: 'Scalp ritual' }
];

export default function OwnerCalendarPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Calendar</p>
          <h1 className="text-3xl font-display text-primary">Manage appointments</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
          <button className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <OwnerSubnav />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface p-6">
          <div className="grid grid-cols-7 gap-3 text-center text-xs text-charcoal/60">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {Array.from({ length: 28 }).map((_, idx) => (
              <div
                key={idx}
                className={`rounded-xl py-3 text-sm ${idx === 17 ? 'bg-primary text-white' : 'bg-white/80'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-display text-primary">Today&apos;s schedule</h2>
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.time} className="card-surface p-4">
                <p className="text-sm text-primary/80">{appointment.time}</p>
                <p className="font-medium text-primary">{appointment.client}</p>
                <p className="text-sm text-charcoal/70">{appointment.service}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
