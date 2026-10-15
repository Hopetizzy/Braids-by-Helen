import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { ShieldCheck, ArrowRight, Scissors } from 'lucide-react';

export const Hero = () => {
  const { openBooking } = useBooking();

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-3 pb-8 sm:pt-6 sm:pb-12 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Luxury Salon Container */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#2D1610] via-[#21100C] to-[#150906] text-white shadow-2xl border border-[#3E231C]">

        {/* Ambient Decorative Lighting Spheres */}
        <div className="absolute top-0 right-1/4 -mt-24 w-80 h-80 rounded-full bg-rosewood-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 -mb-24 w-96 h-96 rounded-full bg-[#C5A46D]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>

        {/* MOBILE VIEW: Luxury magazine editorial beauty layout tailored for mobile devices */}
        <div className="block lg:hidden relative z-10 p-5 sm:p-7 space-y-5">
          {/* Top Salon Micro Tag */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-[#E8C2A0]">
              <Scissors className="w-3.5 h-3.5 text-[#E8C2A0]" />
              <span>Premier Ibadan Hair Studio</span>
            </div>
          </div>

          {/* Headline on Mobile */}
          <div>
            <h1 className="font-serif text-[2.2rem] leading-[1.12] font-bold tracking-tight text-white">
              Precision Braids, Weaving <br />
              <span className="italic font-normal text-[#E8C2A0]">
                & Bespoke Hair Artistry.
              </span>
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mt-2.5">
              Select your style, choose an open date, and confirm your appointment directly in minutes without the endless WhatsApp messaging.
            </p>
          </div>

          {/* Hero Visual Card on Mobile */}
          <div className="relative rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-stone-900 group">
            {/* Glowing Ambient Backlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#150906] via-transparent to-transparent opacity-90 z-10"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-rosewood-600/30 to-amber-500/20 blur-xl opacity-75 pointer-events-none"></div>

            <img
              src="/images/hero-model.jpg"
              alt="Braids by Helen signature hairstyle"
              className="w-full h-[320px] sm:h-[380px] object-cover object-center relative z-0"
            />

            {/* Top Right Floating Badge on Image */}
            <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold">Booking Open Today</span>
            </div>

            {/* Bottom Floating Glass Card on Image */}
            <div className="absolute bottom-3 left-3 right-3 z-20 p-3.5 rounded-2xl bg-[#1A0E0B]/85 backdrop-blur-md border border-white/20 flex items-center justify-between shadow-floating">
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#E8C2A0]">
                  Helen's Signature Studio
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white truncate">
                  Starting from ₦1,500
                </div>
              </div>
              <button
                onClick={() => openBooking()}
                className="bg-rosewood-600 hover:bg-rosewood-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => openBooking()}
              className="bg-rosewood-600 hover:bg-rosewood-700 active:scale-98 text-white font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-card flex items-center justify-center gap-1.5 text-center transition-all"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              onClick={scrollToServices}
              className="bg-white/10 hover:bg-white/15 active:scale-98 text-stone-200 font-semibold text-xs sm:text-sm py-3.5 px-3 rounded-2xl border border-white/15 backdrop-blur-md text-center transition-all"
            >
              <span>Explore 6 Services</span>
            </button>
          </div>

          {/* Quick Style Selector Chips for Mobile */}
          <div className="pt-1">
            <div className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">
              Popular Styles at Helen's Studio:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Knotless & Twists', price: '₦5k', id: 'short-knotless-twists' },
                { name: 'All-back Cornrows', price: '₦1.5k', id: 'all-back' },
                { name: 'Long Knotless', price: '₦7k', id: 'long-knotless-twists' },
                { name: 'Retouching', price: '₦2k', id: 'retouching' },
                { name: 'Hair Washing', price: '₦2k', id: 'hair-washing' },
                { name: "Children's Hair", price: '₦3k', id: 'children-hairstyles' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => openBooking(chip.id)}
                  className="bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-stone-200 flex items-center gap-1.5 transition-all"
                >
                  <span className="font-medium">{chip.name}</span>
                  <span className="text-[#E8C2A0] font-bold">{chip.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Scalp Care Trust Strip */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-white">Gentle Edges</span>
              <span className="text-[9px] text-stone-400">Zero tension pain</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <span className="text-[11px] font-bold text-white">Clean Parting</span>
              <span className="text-[9px] text-stone-400">Crisp neat lines</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-white">Direct Booking</span>
              <span className="text-[9px] text-stone-400">Instant slot lock</span>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Expansive 12-column editorial layout */}
        <div className="hidden lg:grid relative z-10 grid-cols-12 gap-10 items-center p-14 lg:p-16">

          {/* Left Column: Editorial Headline, Actions & Micro Badges */}
          <div className="col-span-7 flex flex-col justify-center space-y-7">

            {/* Main Editorial Headline */}
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Precision Braids, Weaving <br />
              <span className="italic font-normal text-[#E8C2A0]">
                & Bespoke Hair Artistry.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-300 text-base leading-relaxed max-w-xl">
              Select your style, choose an open date, and confirm your appointment directly in minutes without the endless WhatsApp messaging.
            </p>

            {/* Direct CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => openBooking()}
                className="bg-rosewood-600 hover:bg-rosewood-700 active:scale-98 text-white font-semibold text-base px-7 py-3.5 rounded-full shadow-card hover:shadow-floating transition-all duration-200 flex items-center gap-2.5 group"
              >
                <span>Book Appointment</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>

              <button
                onClick={scrollToServices}
                className="bg-white/10 hover:bg-white/15 active:scale-98 text-stone-200 hover:text-white font-medium text-base px-6 py-3.5 rounded-full border border-white/20 backdrop-blur-md transition-all"
              >
                View Services Menu
              </button>
            </div>

            {/* Micro Feature Cards */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">

              {/* Feature Pill 1: Starting Rates */}
              <div
                onClick={scrollToServices}
                className="group/card cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E8C2A0] group-hover/card:scale-105 transition-transform">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Starting From ₦1,500</div>
                    <div className="text-[11px] text-stone-400">All-back, Knotless & Care</div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover/card:bg-white/20 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/card:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Feature Pill 2: Gentle Edge Care */}
              <div
                onClick={() => openBooking()}
                className="group/card cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E8C2A0] group-hover/card:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Gentle Edge Care</div>
                    <div className="text-[11px] text-stone-400">Tension free protection</div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover/card:bg-white/20 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/card:translate-x-0.5 transition-transform" />
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Editorial Visual */}
          <div className="col-span-5 relative flex items-center justify-center">

            {/* Ambient Backlight Behind Portrait */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#962842]/40 via-transparent to-amber-500/20 rounded-3xl blur-2xl transform scale-95 pointer-events-none"></div>

            {/* Model Card Frame */}
            <div className="relative w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl bg-stone-900 group">
              <img
                src="/images/hero-model.jpg"
                alt="Braids by Helen signature hairstyle"
                className="w-full h-[460px] md:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#150906] via-transparent to-transparent opacity-80"></div>

              {/* Floating Bottom Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#E8C2A0]">
                    Signature Finish
                  </div>
                  <div className="text-sm font-serif font-bold text-white">
                    Braids by Helen
                  </div>
                </div>
                <button
                  onClick={() => openBooking()}
                  className="bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-transform active:scale-95 shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
