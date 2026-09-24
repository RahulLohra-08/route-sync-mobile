import type { TripResponse } from '@/features/passenger/passenger.types';

/** Spring LocalDateTime has no timezone, so parse it as device-local time. */
export const parseLocal = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value.length > 23 ? value.slice(0, 23) : value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : '--';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const formatDayLabel = (d: Date | null, now: Date) => {
  if (!d) return '';
  const diff = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatDuration = (minutes?: number | null) => {
  if (minutes == null || minutes <= 0) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
};

export const getGreeting = (now: Date) => {
  const h = now.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export interface TripEta {
  value: string;
  unit: string;
  caption: string;
  overdue: boolean;
}

/** Live trips count down to arrival; everything else counts down to departure. */
export const getTripEta = (trip: TripResponse, now: Date): TripEta => {
  const live = trip.status === 'IN_PROGRESS';
  const target = parseLocal(live ? trip.scheduledEndTime : trip.scheduledStartTime);
  if (!target) return { value: '--', unit: '', caption: 'Schedule unavailable', overdue: false };

  const mins = Math.round((target.getTime() - now.getTime()) / 60_000);
  if (mins <= 0) {
    return {
      value: live ? 'Due' : 'Now',
      unit: '',
      caption: live ? 'Arriving shortly' : trip.status === 'BOARDING' ? 'Boarding now' : 'Leaving any moment',
      overdue: true,
    };
  }
  const caption = live ? 'until arrival' : 'until departure';
  if (mins < 60) return { value: String(mins), unit: 'min', caption, overdue: false };
  if (mins < 1440) return { value: `${Math.floor(mins / 60)}h ${mins % 60}m`, unit: '', caption, overdue: false };
  return { value: `${Math.floor(mins / 1440)}d`, unit: '', caption, overdue: false };
};

/** 0..1 progress of a running trip. */
export const getTripProgress = (trip: TripResponse, now: Date) => {
  const start = parseLocal(trip.actualStartTime) ?? parseLocal(trip.scheduledStartTime);
  const end = parseLocal(trip.scheduledEndTime);
  if (!start || !end || end <= start) return 0;
  const p = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  return Math.min(1, Math.max(0, p));
};
