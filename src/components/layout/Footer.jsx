import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { SALON_INFO } from '../../data/servicesData';
import { MessageSquare, Phone, MapPin, Clock, Lock } from 'lucide-react';

export const Footer = () => {
  const { openBooking, setCurrentView } = useBooking();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 pb-8 px-4 sm:px-6 border-t border-stone-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="Braids by Helen"
                className="h-10 w-auto max-w-[160px] object-contain brightness-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-serif font-bold text-xl text-white tracking-wide">
                Braids by Helen
              </span>
            </div>

            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              "{SALON_INFO.tagline}" Beautiful braids, Ghana weaving, twists, natural hair care, and children's styling crafted with care in Ibadan, Oyo State.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <a
                href={`https://wa.me/${SALON_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-800/80 hover:bg-emerald-900 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: {SALON_INFO.whatsappDisplay}</span>
              </a>

              <span className="bg-stone-800 text-stone-300 px-3 py-1.5 rounded-full text-[11px]">
                TikTok: @{SALON_INFO.tiktok}
              </span>

              <span className="bg-stone-800 text-stone-300 px-3 py-1.5 rounded-full text-[11px]">
                Facebook: @{SALON_INFO.facebook}
              </span>
            </div>
          </div>

          {/* Services Menu */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Services
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>Short & Long Knotless Braids</li>
              <li>Passion & Senegalese Twists</li>
              <li>All-back Cornrows</li>
              <li>Perimeter Retouching</li>
              <li>Clarifying Hair Washing</li>
              <li>Children's Hairstyles & Beads</li>
            </ul>
          </div>

          {/* Studio Hours */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Studio Hours
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p>
                <strong className="text-stone-200">Monday – Saturday:</strong><br />
                8:00 AM – 7:00 PM
              </p>
              <p>
                <strong className="text-stone-200">Sunday:</strong><br />
                1:00 PM – 6:00 PM
              </p>
              <p className="text-[11px] text-rose-300 pt-1">
                Studio and Home Service Available
              </p>
            </div>

            <button
              onClick={() => openBooking()}
              className="mt-4 w-full bg-primary hover:bg-primary-900 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-card transition-all"
            >
              Book Appointment
            </button>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Braids by Helen. All rights reserved.</p>
          
          <button
            onClick={() => setCurrentView('business')}
            className="text-stone-600 hover:text-stone-400 text-[11px] transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100"
            title="Helen Studio Access"
          >
            <Lock className="w-3 h-3" />
            <span>Studio Portal</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
