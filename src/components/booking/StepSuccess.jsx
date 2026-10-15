import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { SALON_INFO } from '../../data/servicesData';
import { CheckCircle2, MessageSquare, Calendar, Copy, Check, Clock } from 'lucide-react';
import { createWhatsAppUrl, generateClientReceiptMessage } from '../../utils/whatsappTemplates';

export const StepSuccess = () => {
  const { confirmedBooking, closeBooking } = useBooking();
  const [copied, setCopied] = useState(false);

  if (!confirmedBooking) return null;

  const bookingRef = confirmedBooking.bookingReference || confirmedBooking.id;

  const waMessage = generateClientReceiptMessage({
    bookingReference: bookingRef,
    customerName: confirmedBooking.customerName,
    serviceName: confirmedBooking.serviceName,
    styleChoice: confirmedBooking.styleChoice,
    date: confirmedBooking.date,
    time: confirmedBooking.time,
    note: confirmedBooking.note,
  });

  const waUrl = createWhatsAppUrl(SALON_INFO.whatsappNumber, waMessage);

  const calTitle = encodeURIComponent(`Braids by Helen: ${confirmedBooking.serviceName}`);
  const calDetails = encodeURIComponent(
    `Hair styling appointment request with Braids by Helen. Style: ${confirmedBooking.styleChoice}. Booking Reference: ${bookingRef}`
  );
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=Braids+by+Helen+Studio+Ibadan`;

  const copyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-center animate-fadeIn py-1">
      {/* Status Icon */}
      <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-1 border border-amber-200">
        <Clock className="w-6 h-6 stroke-[2.5]" />
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending Review
        </span>
        <h3 className="font-serif font-bold text-xl text-stone-900 mt-1.5">
          Booking Request Received
        </h3>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          Your reservation request has been submitted to <strong className="text-stone-800">Braids by Helen</strong>.
        </p>
      </div>

      {/* Structured Confirmation Ticket */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 text-left shadow-lg border border-stone-800 space-y-3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Studio</span>
            <p className="font-serif font-bold text-xs text-rose-200">BRAIDS BY HELEN</p>
          </div>

          <div className="text-right flex items-center gap-1.5">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold">Booking Ref</span>
              <p className="font-mono font-bold text-xs text-amber-300">{bookingRef}</p>
            </div>
            <button
              onClick={copyRef}
              className="text-stone-400 hover:text-white p-1 rounded transition-colors"
              title="Copy Reference"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-stone-400">Service & Style</span>
            <p className="font-bold text-stone-100 truncate">{confirmedBooking.serviceName}</p>
            <p className="text-[10px] text-rose-300 truncate">{confirmedBooking.styleChoice}</p>
          </div>

          <div>
            <span className="text-[10px] text-stone-400">Date & Time</span>
            <p className="font-bold text-stone-100">{confirmedBooking.time}</p>
            <p className="text-[10px] text-stone-300 truncate">{confirmedBooking.date}</p>
          </div>
        </div>

        {/* Client & Status Line */}
        <div className="border-t border-stone-800 pt-2 flex items-center justify-between text-[11px]">
          <span className="text-stone-400">
            Client: <strong className="text-stone-200">{confirmedBooking.customerName}</strong>
          </span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Confirmation
          </span>
        </div>
      </div>

      {/* Helpful Hint */}
      <p className="text-[11px] text-stone-500 leading-relaxed px-2">
        Helen reviews all slot requests to verify hair preparations. Tap the WhatsApp button below to notify Helen right away.
      </p>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 fill-white text-white" />
          <span>Message Helen on WhatsApp</span>
        </a>

        <a
          href={gCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs py-2.5 px-4 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-3.5 h-3.5 text-stone-600" />
          <span>Add to Calendar</span>
        </a>
      </div>

      <button
        onClick={closeBooking}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 py-1"
      >
        Done & Return to Website
      </button>
    </div>
  );
};
