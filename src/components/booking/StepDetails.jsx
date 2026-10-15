import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { User, Phone, MessageSquare, ArrowLeft, Check, Calendar } from 'lucide-react';

export const StepDetails = () => {
  const { bookingData, updateBookingData, setBookingStep, submitBooking } = useBooking();
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    updateBookingData({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!bookingData.fullName || bookingData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!bookingData.phone || bookingData.phone.replace(/[^0-9]/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid WhatsApp number (e.g. 0901 018 9746)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    submitBooking();
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
          Client Information
        </h3>
        <p className="text-xs text-stone-500">
          Enter your contact details to finalize the appointment reservation.
        </p>
      </div>

      {/* Structured Summary Badge */}
      <div className="bg-stone-100/90 border border-stone-200 rounded-2xl p-3.5 text-xs space-y-1.5">
        <div className="flex justify-between items-center text-stone-900 font-bold">
          <span>{bookingData.service?.name}</span>
          <span className="text-rosewood-700 font-mono">{bookingData.service?.priceEstimate}</span>
        </div>
        <div className="text-stone-600 text-[11px] flex items-center justify-between">
          <span>Style: <strong className="text-stone-800">{bookingData.styleChoice}</strong></span>
          <span className="font-semibold text-stone-800">{bookingData.time}</span>
        </div>
        <div className="text-[11px] text-stone-500 font-medium">
          {bookingData.formattedDate}
        </div>
      </div>

      <div className="space-y-3">
        
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
            Full Name <span className="text-rosewood-600">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Ada Client"
              value={bookingData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 transition-all ${
                errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-stone-200'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* WhatsApp Phone Number */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
            WhatsApp Number <span className="text-rosewood-600">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="0901 018 9746"
              value={bookingData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 transition-all ${
                errors.phone ? 'border-red-400 bg-red-50/20' : 'border-stone-200'
              }`}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Braids by Helen will reach out via WhatsApp to confirm final hair length and extension specifications.
          </p>
          {errors.phone && (
            <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.phone}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
            Hair Notes & Extension Preference <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Bringing own hair, sensitive edges, or preferred extension color..."
            value={bookingData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rosewood-500 transition-all resize-none"
          ></textarea>
        </div>

      </div>

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setBookingStep(3)}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="bg-rosewood-600 hover:bg-rosewood-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-card transition-all active:scale-98 flex items-center gap-1.5"
        >
          <span>Confirm Reservation</span>
        </button>
      </div>
    </form>
  );
};
