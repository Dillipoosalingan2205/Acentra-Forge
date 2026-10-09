import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
  X,
} from 'lucide-react';
import { CareProvider, TimelineTask } from '../types/aegis';

interface ProviderMatchingSectionProps {
  tasks: TimelineTask[];
}

export const ProviderMatchingSection: React.FC<ProviderMatchingSectionProps> = ({ tasks }) => {
  const [selectedProvider, setSelectedProvider] = useState<CareProvider | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState('2026-10-14');
  const [bookingTime, setBookingTime] = useState('10:30 AM');

  // Collect unique matched providers across all tasks
  const matchedList: { provider: CareProvider; taskTitle: string }[] = [];
  const seenIds = new Set<string>();

  tasks.forEach((t) => {
    if (t.matched_providers) {
      t.matched_providers.forEach((p) => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          matchedList.push({ provider: p, taskTitle: t.simplified_text_en });
        }
      });
    }
  });

  if (matchedList.length === 0) return null;

  const handleBook = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      setSelectedProvider(null);
      setBookingConfirmed(false);
    }, 2200);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Agent 5: Dynamic Healthcare Provider Matches
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Grounded to Local Directory
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched diagnostic imaging, surgical clinics, and rehab facilities for your discharge orders
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchedList.map(({ provider, taskTitle }) => (
          <div
            key={provider.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {provider.facility_type}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{provider.rating}</span>
                  <span className="text-slate-400 font-normal">({provider.reviews_count})</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {provider.name}
              </h4>

              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                For order: {taskTitle}
              </p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{provider.address} ({provider.distance_km} km away)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{provider.open_hours}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <a
                href={`tel:${provider.phone}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>Call Center</span>
              </a>

              <button
                onClick={() => setSelectedProvider(provider)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Slot Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Coordinate Appointment
                    </h3>
                    <p className="text-xs text-slate-500">{selectedProvider.name}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Facility Type:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedProvider.facility_type}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Direct Phone:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedProvider.phone}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option>09:30 AM - Morning Slot</option>
                      <option>10:30 AM - Morning Slot</option>
                      <option>12:00 PM - Afternoon Slot</option>
                      <option>03:30 PM - Afternoon Slot</option>
                      <option>05:00 PM - Evening Slot</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBook}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm"
                  >
                    Confirm Appointment Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Appointment Request Dispatched!
                </h4>
                <p className="text-xs text-slate-500">
                  Confirmation sent to hospital coordinator for {selectedProvider.name} on {bookingDate} at {bookingTime}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
