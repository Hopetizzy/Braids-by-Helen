import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { TIME_SLOTS } from '../../data/servicesData';
import {
  generateUpcomingDays,
  isDateAllDayBlocked,
  isDateFullyBooked,
  formatDisplayDate,
} from '../../utils/dateUtils';

export const StepDate = () => {
  const { bookingData, updateBookingData, setBookingStep, publicSchedule } = useBooking();

  const allSlotTimes = [
    ...TIME_SLOTS.morning.map(s => s.time),
    ...TIME_SLOTS.afternoon.map(s => s.time),
    ...TIME_SLOTS.evening.map(s => s.time),
  ];

  const days = generateUpcomingDays(14, 0).map(item => {
    const isAllDayOff = isDateAllDayBlocked(item.iso, publicSchedule);
    const isAllSlotsTaken = isDateFullyBooked(item.iso, allSlotTimes, publicSchedule);
    const isBooked = isAllDayOff || isAllSlotsTaken;
    
    // Check if there is an explicit reason attached
    const scheduleMatch = publicSchedule.find(s => s.date === item.iso);

    return {
      ...item,
      isBooked,
      closureReason: scheduleMatch?.reason || (isAllDayOff ? 'Closed' : 'Fully Booked'),
    };
  });

  const handleSelectDate = (item) => {
    if (item.isBooked) return;

    const formattedLabel = item.isToday
      ? `Today, ${item.formatted}`
      : (item.iso === new Date(Date.now() + 86400000).toISOString().split('T')[0]
          ? `Tomorrow, ${item.formatted}`
          : item.formatted);

    updateBookingData({
      date: item.iso,
      formattedDate: formattedLabel,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
          Select Appointment Date
        </h3>
        <p className="text-xs text-stone-500">
          Service: <strong className="text-stone-800">{bookingData.service?.name}</strong>
        </p>
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-[300px] overflow-y-auto p-1">
        {days.map((item) => {
          const isSelected = bookingData.date === item.iso;

          return (
            <button
              key={item.iso}
              type="button"
              disabled={item.isBooked}
              onClick={() => handleSelectDate(item)}
              title={item.isBooked ? `${item.formatted}: ${item.closureReason}` : item.formatted}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                item.isBooked
                  ? 'opacity-45 bg-stone-100 cursor-not-allowed border border-dashed border-stone-300'
                  : isSelected
                  ? 'bg-stone-900 text-white shadow-card ring-2 ring-stone-900 ring-offset-1'
                  : 'bg-white text-stone-800 border border-stone-200 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                {item.dayName}
              </span>
              <span className={`text-base font-bold my-0.5 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                {item.dayNumber}
              </span>
              <span className={`text-[9px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                {item.monthName}
              </span>

              {item.isBooked ? (
                <span className="text-[8px] font-bold text-rose-500 mt-1 uppercase tracking-wider">
                  Full
                </span>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary-light' : 'bg-emerald-500'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary Card */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-stone-800">
          <CalendarIcon className="w-4 h-4 text-stone-600" />
          <span className="font-semibold">
            {bookingData.formattedDate || 'Please choose a date'}
          </span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
          Available Slot
        </span>
      </div>

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setBookingStep(1)}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setBookingStep(3)}
          disabled={!bookingData.date}
          className="bg-rosewood-600 hover:bg-rosewood-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-card transition-all active:scale-98 disabled:opacity-50 flex items-center gap-1"
        >
          <span>Choose Time Slot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
