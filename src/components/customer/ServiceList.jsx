import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { SERVICES, SALON_INFO } from '../../data/servicesData';
import { ServiceCategories } from './ServiceCategories';
import { ServiceCard } from './ServiceCard';
import { Info, Sparkles } from 'lucide-react';

export const ServiceList = () => {
  const { services, selectedCategory } = useBooking();

  const activeServices = services && services.length > 0 ? services : SERVICES;

  const filteredServices = selectedCategory === 'all'
    ? activeServices
    : activeServices.filter(s => s.category === selectedCategory);

  return (
    <section id="services" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section Header (Minerva Salon Style) */}
        <div className="text-center max-w-xl mx-auto mb-10">

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-3">
            Our Services
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Beyond standard hair styling, discover a comprehensive range of protective braids, cornrows, and gentle scalp care tailored to you.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="mb-10">
          <ServiceCategories />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Pricing Policy Disclaimer */}
        <div className="mt-12 bg-white border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 text-center max-w-2xl mx-auto flex items-center justify-center gap-3 text-stone-600 text-xs shadow-soft">
          <Info className="w-4 h-4 text-[#C5A46D] flex-shrink-0" />
          <p>
            <strong className="text-stone-900">Pricing Policy:</strong> {SALON_INFO.pricingNote}
          </p>
        </div>

      </div>
    </section>
  );
};
