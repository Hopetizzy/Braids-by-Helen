import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBooking } from '../../context/BookingContext';
import { StepService } from './StepService';
import { StepDate } from './StepDate';
import { StepTime } from './StepTime';
import { StepDetails } from './StepDetails';
import { StepSuccess } from './StepSuccess';
import { X } from 'lucide-react';

export const BookingModal = () => {
  const { isBookingOpen, closeBooking, bookingStep } = useBooking();

  useEffect(() => {
    if (isBookingOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isBookingOpen]);

  if (!isBookingOpen) return null;

  const stepTitles = [
    'Service',
    'Date',
    'Time',
    'Details',
    'Confirmed'
  ];

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="bg-[#faf8f5] w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] transition-all text-left my-6">
        
        {/* Header with Step Progress */}
        <div className="bg-white px-5 pt-4 pb-3 border-b border-stone-200">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rosewood-600"></span>
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Appointment Reservation
              </span>
            </div>

            <button
              onClick={closeBooking}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Step Indicator */}
          <div className="grid grid-cols-5 gap-1.5">
            {stepTitles.map((title, idx) => {
              const stepNumber = idx + 1;
              const isActive = bookingStep === stepNumber;
              const isPast = bookingStep > stepNumber;

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-rosewood-600'
                        : isPast
                        ? 'bg-stone-800'
                        : 'bg-stone-200'
                    }`}
                  ></div>
                  <span
                    className={`text-[9px] mt-1 font-semibold truncate ${
                      isActive ? 'text-stone-900 font-bold' : 'text-stone-400'
                    }`}
                  >
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-mesh-pattern">
          {bookingStep === 1 && <StepService />}
          {bookingStep === 2 && <StepDate />}
          {bookingStep === 3 && <StepTime />}
          {bookingStep === 4 && <StepDetails />}
          {bookingStep === 5 && <StepSuccess />}
        </div>

      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
};
