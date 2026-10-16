import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { TIME_SLOTS } from '../../data/servicesData';
import { Sun, Sunset, Moon, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { isDateAllDayBlocked, isSlotUnavailable, isSlotInPast } from '../../utils/dateUtils';

export const StepTime = () => {
  const {
    bookingData,
    updateBookingData,
    setBookingStep,
    publicSchedule,
    appointments,
    adminAvailability,
    isSupabaseConfigured,
  } = useBooking();

  const isDayClosed = isDateAllDayBlocked(bookingData.date, publicSchedule);

  const checkSlotStatus = (slotTime, defaultAvailable) => {
    if (!defaultAvailable) return { disabled: true, label: 'Closed' };
    if (isDayClosed) return { disabled: true, label: 'Day Closed' };

    // 1. Check if manually blocked by salon admin
    const isManuallyBlocked = (adminAvailability || []).some(
      a => (a.unavailable_date === bookingData.date || a.date === bookingData.date) &&
           (a.is_all_day || (Array.isArray(a.blocked_slots) && a.blocked_slots.includes(slotTime)))
    );
    if (isManuallyBlocked) {
      return { disabled: true, label: 'Blocked' };
    }

    // 2. Check public schedule (which compiles Supabase RPC closures, admin blocks, and active bookings)
    if (isSlotUnavailable(bookingData.date, slotTime, publicSchedule)) {
      return { disabled: true, label: 'Booked' };
    }

    // 3. Fallback for offline mode without database
    if (!isSupabaseConfigured) {
      const hasLocalBooking = (appointments || []).some(
        a =>
          a.source !== 'Sample Booking' &&
          (a.dateIso === bookingData.date || a.date === bookingData.date) &&
          a.time === slotTime &&
          a.status !== 'rejected' &&
          a.status !== 'cancelled'
      );
      if (hasLocalBooking) {
        return { disabled: true, label: 'Booked' };
      }
    }

    // 4. Past time slot on today
    if (isSlotInPast(bookingData.date, slotTime)) {
      return { disabled: true, label: 'Past' };
    }

    return { disabled: false, label: '' };
  };

  // If currently selected slot is taken, reset selection
  React.useEffect(() => {
    if (bookingData.time && checkSlotStatus(bookingData.time, true).disabled) {
      updateBookingData({ time: '' });
    }
  }, [bookingData.date, publicSchedule, appointments, adminAvailability]);

  const handleSelectSlot = (slotTime, period) => {
    const status = checkSlotStatus(slotTime, true);
    if (status.disabled) return;
    updateBookingData({
      time: slotTime,
      timePeriod: period,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
          Select Time Slot
        </h3>
        <p className="text-xs text-stone-500">
          Date: <strong className="text-stone-800">{bookingData.formattedDate}</strong>
        </p>
      </div>

      {isDayClosed && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>The salon is closed on this date. Please go back and select another date.</span>
        </div>
      )}

      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        
        {/* Morning */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Morning Slots (8:00 AM – 12:00 PM)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.morning.map((slot, idx) => {
              const status = checkSlotStatus(slot.time, slot.available);
              const isSelected = bookingData.time === slot.time;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={status.disabled}
                  onClick={() => handleSelectSlot(slot.time, 'morning')}
                  title={status.disabled ? `Unavailable: ${status.label}` : slot.time}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    status.disabled
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-dashed border-stone-200'
                      : isSelected
                      ? 'bg-stone-900 text-white shadow-card ring-2 ring-stone-900 font-bold'
                      : 'bg-white text-stone-800 border border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={status.disabled ? 'line-through' : ''}>{slot.time}</span>
                  </div>
                  {status.disabled && (
                    <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
                      {status.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
            <Sunset className="w-3.5 h-3.5 text-orange-500" />
            <span>Afternoon Slots (12:00 PM – 4:30 PM)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.afternoon.map((slot, idx) => {
              const status = checkSlotStatus(slot.time, slot.available);
              const isSelected = bookingData.time === slot.time;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={status.disabled}
                  onClick={() => handleSelectSlot(slot.time, 'afternoon')}
                  title={status.disabled ? `Unavailable: ${status.label}` : slot.time}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    status.disabled
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-dashed border-stone-200'
                      : isSelected
                      ? 'bg-stone-900 text-white shadow-card ring-2 ring-stone-900 font-bold'
                      : 'bg-white text-stone-800 border border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={status.disabled ? 'line-through' : ''}>{slot.time}</span>
                  </div>
                  {status.disabled && (
                    <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
                      {status.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evening */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Evening Slots (4:30 PM – 7:00 PM)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.evening.map((slot, idx) => {
              const status = checkSlotStatus(slot.time, slot.available);
              const isSelected = bookingData.time === slot.time;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={status.disabled}
                  onClick={() => handleSelectSlot(slot.time, 'evening')}
                  title={status.disabled ? `Unavailable: ${status.label}` : slot.time}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    status.disabled
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-dashed border-stone-200'
                      : isSelected
                      ? 'bg-stone-900 text-white shadow-card ring-2 ring-stone-900 font-bold'
                      : 'bg-white text-stone-800 border border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={status.disabled ? 'line-through' : ''}>{slot.time}</span>
                  </div>
                  {status.disabled && (
                    <span className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">
                      {status.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setBookingStep(2)}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setBookingStep(4)}
          disabled={!bookingData.time || checkSlotStatus(bookingData.time, true).disabled}
          className="bg-rosewood-600 hover:bg-rosewood-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-card transition-all active:scale-98 disabled:opacity-50 flex items-center gap-1"
        >
          <span>Enter Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
