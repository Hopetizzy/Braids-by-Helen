import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X, MessageSquare, Send } from 'lucide-react';

const REASON_PRESETS = [
  'Fully Booked for Requested Date',
  'Outside Studio Working Hours',
  'Studio Emergency or Temporary Closure',
  'Service or Style Unavailable on Short Notice',
  'Client Requested Cancellation',
  'Other Reason',
];

export const DeclineModal = ({
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

  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a reason for declining');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        reason: selectedReason,
        customNote: customNote.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not decline booking');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto text-left my-6">
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
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Admin Review Action
            </span>
            <h3 className="font-serif font-bold text-lg text-stone-900 mt-0.5">
              Decline Appointment Request
            </h3>
          </div>
        </div>

        {/* Appointment Target */}
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

        {/* Decline Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Preset Radio / Select */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
              Reason for Declining <span className="text-rosewood-600">*</span>
            </label>
            <div className="space-y-2">
              {REASON_PRESETS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-rose-300 bg-rose-50/40 text-stone-900 font-semibold'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Explanatory Note */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Personal Note for Customer Message <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. You are welcome to book any day next week, or reach out directly to check future availability."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
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
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing...' : 'Decline & WhatsApp Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
};
