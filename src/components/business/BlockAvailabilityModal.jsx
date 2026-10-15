import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBooking } from '../../context/BookingContext';
import { TIME_SLOTS } from '../../data/servicesData';
import {
  CalendarX,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import {
  generateUpcomingDays,
  formatDateIso,
  formatDisplayDate,
} from '../../utils/dateUtils';

export const BlockAvailabilityModal = ({ isOpen, onClose }) => {
  const {
    adminAvailability,
    blockDate,
    unblockDate,
    blockSlot,
    unblockSlot,
    appointments,
  } = useBooking();

  const upcomingDays = generateUpcomingDays(21, 0);
  const [selectedDateIso, setSelectedDateIso] = useState(upcomingDays[0]?.iso || '');
  const [closureReason, setClosureReason] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Active record for the selected date
  const activeRecord = adminAvailability.find(
    (a) => a.unavailable_date === selectedDateIso
  );
  const isDateClosedAllDay = Boolean(activeRecord?.is_all_day);
  const blockedSlotsForDate = activeRecord?.blocked_slots || [];

  // Find any confirmed appointments on this date
  const confirmedOnDate = appointments.filter(
    (a) =>
      a.status === 'confirmed' &&
      (a.dateIso === selectedDateIso || a.date === selectedDateIso)
  );

  const handleDateSelect = (iso) => {
    setSelectedDateIso(iso);
    const rec = adminAvailability.find((a) => a.unavailable_date === iso);
    setIsAllDay(Boolean(rec?.is_all_day));
    setClosureReason(rec?.reason || '');
    setShowConfirmWarning(false);
  };

  const handleApplyAllDayClosure = async () => {
    if (confirmedOnDate.length > 0 && !showConfirmWarning) {
      setPendingAction(() => async () => {
        await blockDate(selectedDateIso, closureReason || 'Salon holiday');
        setShowConfirmWarning(false);
      });
      setShowConfirmWarning(true);
      return;
    }

    await blockDate(selectedDateIso, closureReason || 'Salon holiday');
  };

  const handleReopenDate = async () => {
    await unblockDate(selectedDateIso);
    setIsAllDay(false);
    setClosureReason('');
  };

  const handleToggleSlot = async (slotTime) => {
    if (isDateClosedAllDay) return;

    if (blockedSlotsForDate.includes(slotTime)) {
      await unblockSlot(selectedDateIso, slotTime);
    } else {
      // Check if this slot already has a confirmed client
      const clashingClient = confirmedOnDate.find((a) => a.time === slotTime);
      if (clashingClient && !showConfirmWarning) {
        setPendingAction(() => async () => {
          await blockSlot(selectedDateIso, slotTime, closureReason || 'Unavailable');
          setShowConfirmWarning(false);
        });
        setShowConfirmWarning(true);
        return;
      }
      await blockSlot(selectedDateIso, slotTime, closureReason || 'Unavailable');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rosewood-50 text-rosewood-700 flex items-center justify-center border border-rosewood-100">
              <CalendarX className="w-5 h-5 text-rosewood-600" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                Salon Availability Controls
              </h2>
              <p className="text-xs text-stone-500">
                Close full dates or block hours to prevent double bookings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Confirmation Guard Alert Modal */}
          {showConfirmWarning && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Confirmed Client Booking Notice
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    There {confirmedOnDate.length === 1 ? 'is' : 'are'}{' '}
                    <strong>{confirmedOnDate.length}</strong> confirmed appointment(s)
                    on {formatDisplayDate(selectedDateIso)}:
                  </p>
                  <ul className="text-xs text-amber-900 font-semibold list-disc list-inside mt-1 space-y-0.5">
                    {confirmedOnDate.map((c) => (
                      <li key={c.id}>
                        {c.customerName} at {c.time} ({c.bookingReference})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Applying this block requires you to contact the client(s) to reschedule.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setShowConfirmWarning(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-amber-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => pendingAction && pendingAction()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-soft"
                >
                  Confirm & Apply Block
                </button>
              </div>
            </div>
          )}

          {/* Date Selector Row */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
              Select Calendar Date to Manage
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {upcomingDays.map((d) => {
                const isSelected = selectedDateIso === d.iso;
                const record = adminAvailability.find(
                  (a) => a.unavailable_date === d.iso
                );
                const hasBlock = Boolean(record?.is_all_day || record?.blocked_slots?.length);

                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => handleDateSelect(d.iso)}
                    className={`min-w-[70px] py-2 px-2 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-card ring-2 ring-stone-900 ring-offset-1'
                        : hasBlock
                        ? 'bg-rose-50 text-stone-800 border-rose-200 hover:bg-rose-100'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {d.dayName}
                    </span>
                    <span className="text-base font-bold my-0.5">{d.dayNumber}</span>
                    <span
                      className={`text-[9px] ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {d.monthName}
                    </span>

                    {record?.is_all_day ? (
                      <span className="text-[8px] bg-rose-500 text-white font-bold px-1 rounded mt-1">
                        Closed
                      </span>
                    ) : record?.blocked_slots?.length ? (
                      <span className="text-[8px] text-amber-600 font-bold mt-1">
                        {record.blocked_slots.length} blocked
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Banner for Selected Date */}
          <div className="p-3.5 rounded-2xl border bg-stone-50/80 border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-stone-600" />
              <div>
                <span className="font-bold text-stone-900 block">
                  {formatDisplayDate(selectedDateIso)}
                </span>
                <span className="text-[11px] text-stone-500">
                  {isDateClosedAllDay
                    ? `Entire day closed (${activeRecord?.reason || 'Salon holiday'})`
                    : blockedSlotsForDate.length > 0
                    ? `${blockedSlotsForDate.length} slot(s) currently blocked`
                    : 'Open for appointments'}
                </span>
              </div>
            </div>

            {isDateClosedAllDay ? (
              <button
                type="button"
                onClick={handleReopenDate}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-soft"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reopen Full Day</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Reason (optional holiday/errand)"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={handleApplyAllDayClosure}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-soft"
                >
                  <CalendarX className="w-3.5 h-3.5" />
                  <span>Close Day</span>
                </button>
              </div>
            )}
          </div>

          {/* Time Slot Blocking Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Selective Slot Blocking for {formatDisplayDate(selectedDateIso)}
              </label>
              <span className="text-[11px] text-stone-500">
                Click a slot to block or unblock
              </span>
            </div>

            {isDateClosedAllDay ? (
              <div className="p-4 bg-stone-100 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
                The entire day is closed. Reopen the day above if you want to block individual hours instead.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Morning */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Morning Slots
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.morning.map((slot) => {
                      const isBlocked = blockedSlotsForDate.includes(slot.time);
                      const isConfirmed = confirmedOnDate.some(
                        (a) => a.time === slot.time
                      );

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleToggleSlot(slot.time)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : isConfirmed
                              ? 'bg-stone-900 text-white border-stone-900 shadow-soft'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{slot.time}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              isBlocked
                                ? 'text-rose-600'
                                : isConfirmed
                                ? 'text-amber-300'
                                : 'text-stone-400'
                            }`}
                          >
                            {isBlocked
                              ? 'Blocked'
                              : isConfirmed
                              ? 'Booked'
                              : 'Open'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Afternoon Slots
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.afternoon.map((slot) => {
                      const isBlocked = blockedSlotsForDate.includes(slot.time);
                      const isConfirmed = confirmedOnDate.some(
                        (a) => a.time === slot.time
                      );

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleToggleSlot(slot.time)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : isConfirmed
                              ? 'bg-stone-900 text-white border-stone-900 shadow-soft'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{slot.time}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              isBlocked
                                ? 'text-rose-600'
                                : isConfirmed
                                ? 'text-amber-300'
                                : 'text-stone-400'
                            }`}
                          >
                            {isBlocked
                              ? 'Blocked'
                              : isConfirmed
                              ? 'Booked'
                              : 'Open'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Evening */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Evening Slots
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.evening.map((slot) => {
                      const isBlocked = blockedSlotsForDate.includes(slot.time);
                      const isConfirmed = confirmedOnDate.some(
                        (a) => a.time === slot.time
                      );

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleToggleSlot(slot.time)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : isConfirmed
                              ? 'bg-stone-900 text-white border-stone-900 shadow-soft'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{slot.time}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              isBlocked
                                ? 'text-rose-600'
                                : isConfirmed
                                ? 'text-amber-300'
                                : 'text-stone-400'
                            }`}
                          >
                            {isBlocked
                              ? 'Blocked'
                              : isConfirmed
                              ? 'Booked'
                              : 'Open'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List of All Active Scheduled Blocks */}
          <div className="pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Active Studio Schedule Records
            </h4>
            {adminAvailability.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                No active date closures or blocked hours recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {adminAvailability.map((rec) => (
                  <div
                    key={rec.unavailable_date}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-stone-900">
                        {formatDisplayDate(rec.unavailable_date)}
                      </strong>
                      <span className="text-stone-500 ml-2">
                        {rec.is_all_day
                          ? `Full Day Closed (${rec.reason || 'Salon holiday'})`
                          : `${rec.blocked_slots?.length || 0} slot(s) blocked`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => unblockDate(rec.unavailable_date)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete schedule block and reopen date"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all shadow-soft"
          >
            Done Managing
          </button>
        </div>
      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
};
