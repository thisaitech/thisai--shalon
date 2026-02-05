export type DayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type BusinessHours = Record<DayKey, { open: string; close: string; closed?: boolean }>;

export const defaultBusinessHours: BusinessHours = {
  monday: { open: '09:00', close: '19:00' },
  tuesday: { open: '09:00', close: '19:00' },
  wednesday: { open: '09:00', close: '19:00' },
  thursday: { open: '09:00', close: '20:00' },
  friday: { open: '09:00', close: '20:00' },
  saturday: { open: '10:00', close: '18:00' },
  sunday: { open: '11:00', close: '16:00' }
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getDayKey(date: Date): DayKey {
  const map: DayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];
  return map[date.getDay()];
}

export function isWithinBusinessHours(
  date: Date,
  time: string,
  businessHours: BusinessHours,
  durationMinutes = 0
) {
  const dayKey = getDayKey(date);
  const hours = businessHours[dayKey];
  if (!hours || hours.closed) return false;
  const start = parseTimeToMinutes(time);
  const open = parseTimeToMinutes(hours.open);
  const close = parseTimeToMinutes(hours.close);
  return start >= open && start + durationMinutes <= close;
}

export function generateTimeSlots({
  date,
  businessHours,
  intervalMinutes,
  serviceDuration
}: {
  date: Date;
  businessHours: BusinessHours;
  intervalMinutes: number;
  serviceDuration: number;
}) {
  const dayKey = getDayKey(date);
  const hours = businessHours[dayKey];
  if (!hours || hours.closed) return [] as string[];

  const open = parseTimeToMinutes(hours.open);
  const close = parseTimeToMinutes(hours.close);
  const slots: string[] = [];
  for (
    let minutes = open;
    minutes + serviceDuration <= close;
    minutes += intervalMinutes
  ) {
    const hrs = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    slots.push(`${hrs}:${mins}`);
  }
  return slots;
}

export function isOverlapping(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number
) {
  const aStart = parseTimeToMinutes(startA);
  const bStart = parseTimeToMinutes(startB);
  const aEnd = aStart + durationA;
  const bEnd = bStart + durationB;
  return aStart < bEnd && bStart < aEnd;
}
