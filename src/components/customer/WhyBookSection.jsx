import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { MessageSquare, CalendarCheck, X, Check, ArrowRight } from 'lucide-react';

export const WhyBookSection = () => {
  const { openBooking, setCurrentView } = useBooking();

  return (
    <section id="why-book" className="py-12 sm:py-18 px-4 sm:px-6 bg-stone-100/60 border-y border-stone-200/80">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-rosewood-600 mb-1.5 block">
            Direct Scheduling
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mb-2.5">
            A Better Booking Experience
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Eliminating back and forth messaging so you can reserve your hair appointment in seconds.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
          
          {/* WhatsApp Back and Forth Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-soft">
            <div className="flex items-center gap-3 mb-5 text-stone-800">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">Traditional WhatsApp Inquiries</h3>
                <p className="text-[11px] text-stone-500 font-medium">Manual coordination</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-stone-600">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Sending messages asking for open dates and salon hours</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Waiting for replies while preferred slots fill up</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Manual clarification of hair length, style variations, and extensions</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>No automated calendar invite or structured booking confirmation</span>
              </li>
            </ul>
          </div>

          {/* Lyna Direct Booking Card */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-floating border border-stone-800 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-rosewood-600 flex items-center justify-center text-white shadow-sm">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Direct Self-Scheduling</h3>
                <p className="text-[11px] text-rose-300 font-medium">Instant & structured</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-stone-300 relative z-10">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Select your exact braids, weaving, or twist style in one tap</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Choose from open morning, afternoon, and evening appointment slots</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Structured appointment ticket with one-click WhatsApp sync</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Lyna Hair Touch receives clean client details directly to the studio schedule</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
