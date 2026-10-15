import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { SALON_INFO } from '../../data/servicesData';
import { Calendar, CalendarPlus, MessageSquare, Menu, X, Scissors, Star } from 'lucide-react';

export const Navbar = () => {
  const { openBooking, setCurrentView, currentView } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (currentView !== 'customer') {
      setCurrentView('customer');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-primary-100/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => scrollToSection('hero')}
        >
          <img
            src="/assets/logo.png"
            alt="Braids by Helen"
            className="h-10 w-auto max-w-[140px] sm:max-w-[180px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-espresso tracking-tight text-sm sm:text-base leading-none">
              Braids by Helen
            </span>
            <span className="text-[10px] text-espresso-700 font-medium tracking-wider uppercase mt-0.5">
              {SALON_INFO.tagline}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-stone-600">
          <button
            onClick={() => scrollToSection('services')}
            className="hover:text-rosewood-700 transition-colors"
          >
            Services & Pricing
          </button>
          <button
            onClick={() => scrollToSection('why-book')}
            className="hover:text-rosewood-700 transition-colors"
          >
            Direct Booking
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="hover:text-rosewood-700 transition-colors"
          >
            Portfolio & Highlights
          </button>
          
          <a
            href={`https://wa.me/${SALON_INFO.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-stone-700 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200 shadow-soft transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp: {SALON_INFO.whatsappDisplay}</span>
          </a>
        </nav>

        {/* Desktop CTA Action & Mobile Hamburger Menu */}
        <div className="flex items-center gap-2">
          
          {/* Desktop-only Book Appointment button */}
          <button
            onClick={() => openBooking()}
            className="hidden md:flex bg-rosewood-600 hover:bg-rosewood-700 active:scale-98 text-white text-xs sm:text-sm font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-card transition-all items-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>

          {/* Mobile Menu Toggle (Prominent on mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200/60 shadow-xs"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-2 animate-fadeIn shadow-lg">
          
          {/* Mobile Book Button inside menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openBooking();
            }}
            className="w-full bg-rosewood-600 hover:bg-rosewood-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 mb-2"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={() => scrollToSection('services')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4 text-rosewood-600" />
            <span>Services & Pricing</span>
          </button>
          
          <button
            onClick={() => scrollToSection('why-book')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-rosewood-600" />
            <span>Direct Scheduling</span>
          </button>
          
          <button
            onClick={() => scrollToSection('reviews')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-rosewood-600" />
            <span>Portfolio & Highlights</span>
          </button>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${SALON_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </span>
              <span className="font-mono">{SALON_INFO.whatsappDisplay}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
