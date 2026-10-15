import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';

export const ServiceCard = ({ service }) => {
  const { openBooking } = useBooking();

  return (
    <div className="group bg-[#FFFCF8] hover:bg-white rounded-[2rem] p-4 sm:p-5 border border-[#EFE5D8] hover:border-rosewood-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      
      <div>
        {/* Visual Preview Frame */}
        <div className="relative w-full h-56 sm:h-60 rounded-[1.75rem] overflow-hidden mb-4 bg-stone-100 shadow-inner group/img">
          {service.tag && (
            <span className="absolute top-3 right-3 z-10 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase border border-white/10">
              {service.tag}
            </span>
          )}
          <img
            src={service.image || service.imageUrl || '/images/knotless-braids.png'}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-90"></div>
          
          {/* Bottom Floating Price and Duration Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full font-medium text-[11px] border border-white/10">
              <Clock className="w-3 h-3 text-[#E8C2A0]" />
              {service.duration || service.durationEstimate || '1.5 to 3 hrs'}
            </span>
            <span className="font-bold text-white bg-rosewood-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs shadow-sm border border-white/15">
              {service.priceEstimate || (service.startingPrice ? `From ₦${Number(service.startingPrice).toLocaleString()}` : 'From ₦1,500')}
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-2 px-1">
          <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug group-hover:text-rosewood-700 transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-rosewood-600 font-medium mt-0.5">
            {service.subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 leading-relaxed mb-4 px-1 line-clamp-2">
          {service.description}
        </p>

        {/* Style Variations Pills */}
        <div className="mb-4 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
            Popular Options
          </span>
          <div className="flex flex-wrap gap-1.5">
            {service.styles && service.styles.slice(0, 3).map((style, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-stone-100 group-hover:bg-amber-50/60 text-stone-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                {style}
              </span>
            ))}
            {service.styles && service.styles.length > 3 && (
              <span className="text-[11px] bg-rosewood-50 text-rosewood-700 font-semibold px-2 py-1 rounded-lg">
                +{service.styles.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Book CTA Button */}
      <div className="pt-3 px-1 border-t border-stone-200/60">
        <button
          onClick={() => openBooking(service.id)}
          className="w-full bg-stone-900 hover:bg-rosewood-600 active:scale-98 text-white text-xs font-semibold py-3 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group/btn"
        >
          <span>Book This Style</span>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </button>
      </div>

    </div>
  );
};
