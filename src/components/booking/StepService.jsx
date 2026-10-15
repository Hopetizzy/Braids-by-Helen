import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { SERVICES } from '../../data/servicesData';
import { Check, Clock, ArrowRight } from 'lucide-react';

export const StepService = () => {
  const { bookingData, updateBookingData, setBookingStep, services } = useBooking();
  const activeServices = (services && services.length > 0 ? services : SERVICES).filter(
    s => s.isActive !== false
  );

  const handleSelectService = (service) => {
    updateBookingData({
      service: service,
      styleChoice: (service.styles && service.styles[0]) || '',
    });
  };

  const handleSelectStyle = (style) => {
    updateBookingData({ styleChoice: style });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
          Select Hair Service
        </h3>
        <p className="text-xs text-stone-500">
          Choose a service and specific style variation.
        </p>
      </div>

      {/* Services Radio Cards */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {activeServices.map((service) => {
          const isSelected =
            bookingData.service?.id === service.id ||
            bookingData.service?.dbId === service.dbId ||
            bookingData.service?.slug === service.slug;

          return (
            <div
              key={service.id}
              onClick={() => handleSelectService(service)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-rosewood-600 bg-rosewood-50/40 shadow-sm ring-1 ring-rosewood-500'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-rosewood-600 bg-rosewood-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="font-bold text-xs text-stone-900">{service.name}</span>
                </div>

                <span className="text-[11px] font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
                  {service.priceEstimate}
                </span>
              </div>

              <p className="text-[11px] text-stone-500 pl-6 mb-2">
                {service.subtitle} • {service.duration}
              </p>

              {/* Specific Style Variations */}
              {isSelected && (
                <div className="mt-2.5 pt-2.5 border-t border-rosewood-200/60 pl-6 animate-fadeIn">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Select Variation:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.styles.map((style, idx) => {
                      const isStyleActive = bookingData.styleChoice === style;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStyle(style);
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                            isStyleActive
                              ? 'bg-stone-900 text-white font-bold shadow-xs'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-stone-100 flex justify-end">
        <button
          onClick={() => setBookingStep(2)}
          disabled={!bookingData.service}
          className="w-full bg-rosewood-600 hover:bg-rosewood-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <span>Continue to Choose Date</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
