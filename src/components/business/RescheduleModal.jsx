import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, X, MessageSquare, Send } from 'lucide-react';

const COMMON_SLOTS = [
  '08:30 AM',
  '09:30 AM',
  '11:00 AM',
  '01:30 PM',
  '02:30 PM',
  '04:00 PM',
  '05:30 PM',
];

export const RescheduleModal = ({
  appointment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  // Default proposed date to tomorrow
  const defaultDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [proposedDate, setProposedDate] = useState(defaultDate);
  const [proposedTimeSlot, setProposedTimeSlot] = useState(COMMON_SLOTS[0]);
  const [customSlot, setCustomSlot] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSlot = customSlot.trim() || proposedTimeSlot;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposedDate) {
      setError('Please select an alternative date');
      return;
    }
    if (!selectedSlot) {
      setError('Please select or specify a time slot');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        proposedDate,
        proposedTimeSlot: selectedSlot,
        note: note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save reschedule proposal');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto text-left my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Admin Review Action
            </span>
            <h3 className="font-serif font-bold text-lg text-stone-900 mt-0.5">
              Propose Alternative Time
            </h3>
          </div>
        </div>

        {/* Original Appointment Card Summary */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 mb-4 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Client:</span>
            <strong className="text-stone-900">{appointment.customerName}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Service:</span>
            <span className="font-semibold text-rosewood-800">{appointment.serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Requested:</span>
            <span className="font-mono text-stone-800">{appointment.date} at {appointment.time}</span>
          </div>
        </div>

        {/* Reschedule Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alternative Date */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Select Alternative Date <span className="text-rosewood-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={proposedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 font-medium text-stone-800"
                required
              />
            </div>
          </div>

          {/* Preset Time Slots */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Select Alternative Time Slot <span className="text-rosewood-600">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-2">
              {COMMON_SLOTS.map((slot) => {
                const isSelected = !customSlot && proposedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setProposedTimeSlot(slot);
                      setCustomSlot('');
                    }}
                    className={`py-2 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {/* Custom Slot Input */}
            <div className="relative">
              <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Or specify custom slot (e.g. 03:15 PM)"
                value={customSlot}
                onChange={(e) => setCustomSlot(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 text-stone-800"
              />
            </div>
          </div>

          {/* Explanatory Note for Customer */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Personal Note for Helen's WhatsApp Message <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. The earlier morning slot is reserved for long braids. I am happy to welcome you at this alternative time!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 resize-none text-stone-800"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Updating...' : 'Propose Slot & WhatsApp Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
};
