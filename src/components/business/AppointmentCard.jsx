import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import {
  MessageSquare,
  Phone,
  Check,
  Trash2,
  Calendar,
  Clock,
  CalendarClock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  createWhatsAppUrl,
  generateAdminConfirmationMessage,
  generateAdminRescheduleMessage,
  generateAdminDeclineMessage,
  generateAdminDirectContactMessage,
} from '../../utils/whatsappTemplates';
import { RescheduleModal } from './RescheduleModal';
import { DeclineModal } from './DeclineModal';

export const AppointmentCard = ({ appointment }) => {
  const {
    confirmAppointment,
    rescheduleAppointment,
    declineAppointment,
    completeAppointment,
    deleteAppointment,
    getAppointmentConflict,
  } = useBooking();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictDetail, setConflictDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const status = appointment.status || 'pending';
  const isPending = status === 'new' || status === 'pending';
  const isConfirmed = status === 'confirmed';
  const isRescheduleProposed = status === 'reschedule_proposed';
  const isRejected = status === 'rejected';
  const isCompleted = status === 'completed';

  const conflict = getAppointmentConflict ? getAppointmentConflict(appointment) : null;

  const bookingRef = appointment.bookingReference || appointment.id;
  const clientPhoneClean = appointment.whatsappClean || appointment.phone;

  // Direct WhatsApp chat link
  const directWaMessage = generateAdminDirectContactMessage({
    customerName: appointment.customerName,
    serviceName: appointment.serviceName,
    bookingReference: bookingRef,
  });
  const directWaUrl = createWhatsAppUrl(clientPhoneClean, directWaMessage);

  // Confirm booking action with atomic check and WhatsApp launch (AC 2, AC 7)
  const handleConfirm = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setShowConflictDialog(false);
      await confirmAppointment(appointment.id);

      const confirmMessage = generateAdminConfirmationMessage({
        customerName: appointment.customerName,
        serviceName: appointment.serviceName,
        date: appointment.date,
        time: appointment.time,
        bookingReference: bookingRef,
      });
      const confirmWaUrl = createWhatsAppUrl(clientPhoneClean, confirmMessage);
      window.open(confirmWaUrl, '_blank');
    } catch (err) {
      const msg = err.message || 'Could not confirm appointment due to a scheduling conflict';
      setErrorMessage(msg);
      setConflictDetail({
        message: msg,
        isDoubleBooked: msg.includes('Double booking conflict'),
        isDateBlocked: msg.includes('Date conflict'),
        isSlotBlocked: msg.includes('Time slot conflict'),
      });
      setShowConflictDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Submit reschedule proposal and launch WhatsApp (AC 5)
  const handleRescheduleSubmit = async ({ proposedDate, proposedTimeSlot, note }) => {
    await rescheduleAppointment(appointment.id, { proposedDate, proposedTimeSlot, note });

    const rescheduleMessage = generateAdminRescheduleMessage({
      customerName: appointment.customerName,
      serviceName: appointment.serviceName,
      originalDate: appointment.date,
      originalTime: appointment.time,
      proposedDate,
      proposedTime: proposedTimeSlot,
      note,
    });
    const rescheduleWaUrl = createWhatsAppUrl(clientPhoneClean, rescheduleMessage);
    try {
      window.open(rescheduleWaUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = rescheduleWaUrl;
    }
  };

  // Submit decline reason and launch WhatsApp (AC 6)
  const handleDeclineSubmit = async ({ reason, customNote }) => {
    await declineAppointment(appointment.id, { reason, customNote });

    const declineMessage = generateAdminDeclineMessage({
      customerName: appointment.customerName,
      serviceName: appointment.serviceName,
      date: appointment.date,
      time: appointment.time,
      reason,
      customNote,
    });
    const declineWaUrl = createWhatsAppUrl(clientPhoneClean, declineMessage);
    window.open(declineWaUrl, '_blank');
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-soft ${
        isPending
          ? 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-200'
          : isConfirmed
          ? 'border-emerald-300 bg-emerald-50/10'
          : isRescheduleProposed
          ? 'border-sky-300 bg-sky-50/10'
          : isRejected
          ? 'border-rose-200 bg-rose-50/10 opacity-90'
          : 'border-stone-200 opacity-85'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-stone-900 text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
            {appointment.time}
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 block font-mono">
              {bookingRef}
            </span>
            <span className="text-xs font-semibold text-stone-800">
              {appointment.date}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {conflict && isPending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-soft">
              <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span>Conflict: {conflict.title}</span>
            </span>
          )}

          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Pending Review
            </span>
          )}

          {isConfirmed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Confirmed
            </span>
          )}

          {isRescheduleProposed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Reschedule Offered
            </span>
          )}

          {isRejected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Declined
            </span>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Schedule Conflict Warning Banner (AC 6) */}
      {conflict && isPending && (
        <div className="bg-amber-50/95 border border-amber-200 rounded-2xl p-3 mb-3 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-amber-900">
                {conflict.title}: {conflict.message}
              </strong>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Confirmation is prevented under Policy B. Propose an alternative date or decline this request.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-soft transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={() => setShowDeclineModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Client and Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
            Client
          </span>
          <p className="font-bold text-sm text-stone-900">{appointment.customerName}</p>
          <div className="flex items-center gap-1.5 text-stone-600 text-[11px] mt-0.5">
            <Phone className="w-3 h-3 text-stone-400" />
            <a
              href={`tel:${appointment.phone}`}
              className="hover:underline font-medium text-stone-700"
            >
              {appointment.phone}
            </a>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
            Requested Style
          </span>
          <p className="font-bold text-sm text-rosewood-800">{appointment.serviceName}</p>
          <p className="text-[11px] text-stone-600 font-medium">{appointment.styleChoice}</p>
        </div>
      </div>

      {/* Reschedule Proposal Display */}
      {isRescheduleProposed && appointment.proposedDate && (
        <div className="bg-sky-50/80 rounded-xl p-2.5 mb-3 border border-sky-200 text-[11px] text-sky-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sky-800">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Alternative Proposed Slot:</span>
          </div>
          <p className="font-mono font-semibold">
            {appointment.proposedDate} at {appointment.proposedTimeSlot}
          </p>
          {appointment.rescheduleNote && (
            <p className="text-stone-600 text-[10px] italic">"{appointment.rescheduleNote}"</p>
          )}
        </div>
      )}

      {/* Rejection Reason Display */}
      {isRejected && appointment.rejectionReason && (
        <div className="bg-rose-50/80 rounded-xl p-2.5 mb-3 border border-rose-200 text-[11px] text-rose-900">
          <strong className="text-rose-800">Decline Reason:</strong> {appointment.rejectionReason}
        </div>
      )}

      {/* Customer Note */}
      {appointment.note && appointment.note !== 'None provided' && (
        <div className="bg-stone-50 rounded-xl p-2.5 mb-3 border border-stone-100 text-[11px] text-stone-600">
          <strong className="text-stone-700">Client Note:</strong> "{appointment.note}"
        </div>
      )}

      {/* Error Callout */}
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
        {/* WhatsApp Chat Button */}
        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          title="Open WhatsApp chat with client"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Client</span>
        </a>

        {/* Review Action Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          {isPending && (
            <>
              {/* Confirm Slot */}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-50"
                title="Confirm appointment and open WhatsApp confirmation"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{loading ? 'Confirming...' : 'Confirm'}</span>
              </button>

              {/* Propose Reschedule */}
              <button
                onClick={() => setShowRescheduleModal(true)}
                disabled={loading}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                title="Propose another date or time slot"
              >
                <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                <span>Reschedule</span>
              </button>

              {/* Decline Request */}
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={loading}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                title="Decline appointment with structured reason"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Decline</span>
              </button>
            </>
          )}

          {isRescheduleProposed && (
            <>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                title="Confirm rescheduled slot"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Slot</span>
              </button>

              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={loading}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Decline</span>
              </button>
            </>
          )}

          {isConfirmed && (
            <button
              onClick={() => completeAppointment(appointment.id)}
              className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            >
              Mark Completed
            </button>
          )}

          {/* Delete or archive */}
          <button
            onClick={() => deleteAppointment(appointment.id)}
            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Remove appointment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        appointment={appointment}
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onSubmit={handleRescheduleSubmit}
      />

      {/* Decline Modal */}
      <DeclineModal
        appointment={appointment}
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onSubmit={handleDeclineSubmit}
      />

      {/* Atomic Confirmation Collision Alert Modal (AC 7) */}
      {showConflictDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 p-5 sm:p-6 text-stone-900 animate-scaleUp">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-100">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>

            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              Scheduling Conflict Detected
            </h3>
            
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {conflictDetail?.message || 'This appointment cannot be confirmed because the requested date or time slot is already occupied or closed.'}
            </p>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Client:</span>
                <span className="font-bold">{appointment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Requested Slot:</span>
                <span className="font-bold font-mono">{appointment.date} at {appointment.time}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 mb-4">
              Would you like to propose an alternative slot to this client on WhatsApp or decline the request?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConflictDialog(false);
                  setShowRescheduleModal(true);
                }}
                className="w-full sm:flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all"
              >
                Propose Reschedule
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConflictDialog(false);
                  setShowDeclineModal(true);
                }}
                className="w-full sm:flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => setShowConflictDialog(false)}
                className="w-full sm:w-auto py-2.5 px-3 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
