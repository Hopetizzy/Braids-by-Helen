import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { SALON_INFO, SERVICE_CATEGORIES } from '../../data/servicesData';
import {
  MessageSquare,
  ArrowRight,
  Film,
  Play,
  X,
  Volume2,
  VolumeX,
  Scissors,
} from 'lucide-react';

export const GallerySection = () => {
  const { media, services, openBooking } = useBooking();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  // Filter only published media items
  const publishedMedia = media.filter(
    item => item.isPublished !== false && item.is_published !== false
  );

  const filteredMedia = publishedMedia.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'videos') {
      return (item.mediaType || item.media_type) === 'video';
    }
    return item.category === activeCategory;
  });

  const handleBookStyle = (e, item) => {
    e.stopPropagation();
    const serviceId = item.serviceId || item.service_id;
    const styleTag = item.styleTag || item.style_tag;
    openBooking(serviceId, styleTag);
  };

  const handleOpenVideo = (item) => {
    setActiveVideoModal(item);
    setIsMuted(false); // Unmute for focused viewing
  };

  const handleCloseVideoModal = () => {
    setActiveVideoModal(null);
  };

  return (
    <section id="reviews" className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rosewood-600 block mb-1.5">
              Portfolio & Authentic Transformations
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Styling Artistry
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Authentic client photos and video clips captured directly in our studio. Tap any look to book that exact hairstyle with Helen.
            </p>
          </div>

          <a
            href={`https://wa.me/${SALON_INFO.whatsappNumber}?text=Hello%20Braids%20by%20Helen%2C%20I%20saw%20your%20portfolio%20and%20wanted%20to%20inquire%20about%20an%20appointment.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 px-4 py-2.5 rounded-full hover:bg-stone-50 transition-colors shadow-soft flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Connect on WhatsApp</span>
          </a>
        </div>

        {/* Category & Media Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-rosewood-700 text-white shadow-soft'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Works ({publishedMedia.length})
          </button>

          <button
            onClick={() => setActiveCategory('videos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === 'videos'
                ? 'bg-rosewood-700 text-white shadow-soft'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span>Video Reels</span>
          </button>

          {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rosewood-700 text-white shadow-soft'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid or Clean Empty State */}
        {filteredMedia.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-3xl bg-white border border-stone-200/80 shadow-soft mb-14">
            <div className="w-14 h-14 rounded-full bg-rosewood-50 text-rosewood-600 flex items-center justify-center mx-auto mb-3">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              {publishedMedia.length === 0 ? 'Gallery Updating Soon' : 'No Media in this Category'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mb-5">
              {publishedMedia.length === 0
                ? "Helen's latest authentic studio transformations and styling reels will appear here once uploaded."
                : 'Try selecting another category or view all styling works.'}
            </p>
            <a
              href={`https://wa.me/${SALON_INFO.whatsappNumber}?text=Hello%20Braids%20by%20Helen%2C%20I%20would%20like%20to%20see%20recent%20examples%20of%20your%20hair%20work.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-rosewood-700 hover:bg-rosewood-800 px-5 py-2.5 rounded-full transition-all shadow-soft"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire About Styles on WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-14">
            {filteredMedia.map((item) => {
              const isVideo = (item.mediaType || item.media_type) === 'video';
              const url = item.publicUrl || item.public_url;
              const serviceId = item.serviceId || item.service_id;
              const styleTag = item.styleTag || item.style_tag;

              // Associated service
              const linkedService = services.find(
                s => s.id === serviceId || s.dbId === serviceId || s.slug === serviceId
              );

              return (
                <div
                  key={item.id}
                  onClick={() => (isVideo ? handleOpenVideo(item) : openBooking(serviceId, styleTag))}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-900 cursor-pointer shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
                >
                  {/* Visual Media Background */}
                  {isVideo ? (
                    <div className="absolute inset-0 w-full h-full">
                      <video
                        src={url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        preload="metadata"
                        muted
                        playsInline
                        loop
                        autoPlay
                      />
                      {/* Video Duration / Reel Badge */}
                      <span className="absolute top-3 left-3 text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm">
                        <Film className="w-3 h-3 text-rose-300" />
                        <span>{item.durationText || 'Reel'}</span>
                      </span>

                      {/* Central Play Indicator Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={url}
                        alt={item.title || 'Client hairstyle'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Shaded Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity pointer-events-none"></div>

                  {/* Category Tag at Top Right */}
                  <div className="relative p-3 flex justify-end z-10">
                    {linkedService && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                        {linkedService.name}
                      </span>
                    )}
                  </div>

                  {/* Bottom Card Details & Book This Style Action */}
                  <div className="relative p-4 text-white z-10">
                    {styleTag && (
                      <span className="text-[11px] text-blush-300 font-semibold block mb-0.5">
                        {styleTag}
                      </span>
                    )}

                    <h3 className="font-serif font-bold text-sm sm:text-base leading-tight mb-1 text-white">
                      {item.title}
                    </h3>

                    {item.caption && (
                      <p className="text-[11px] text-stone-300 line-clamp-1 mb-2.5 font-normal">
                        {item.caption}
                      </p>
                    )}

                    {/* Interactive Trigger Button */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                      <button
                        onClick={(e) => handleBookStyle(e, item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-200 group-hover:text-white bg-white/15 hover:bg-rosewood-600 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <Scissors className="w-3.5 h-3.5 text-rose-300" />
                        <span>Book This Style</span>
                      </button>

                      <span className="text-[10px] text-stone-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Video Player Expanded Modal */}
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
            <div className="bg-stone-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh] relative">
              
              {/* Close Button */}
              <button
                onClick={handleCloseVideoModal}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                title="Close video preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Player Body */}
              <div className="relative bg-black flex items-center justify-center aspect-[9/14] sm:aspect-[4/3] max-h-[60vh] overflow-hidden">
                <video
                  src={activeVideoModal.publicUrl || activeVideoModal.public_url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  muted={isMuted}
                />

                {/* Mute Toggle Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Video Information & Direct Reservation CTA */}
              <div className="p-5 sm:p-6 bg-stone-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-stone-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rosewood-900/80 px-2 py-0.5 rounded-md">
                      {activeVideoModal.category || 'Braids'}
                    </span>
                    {activeVideoModal.styleTag && (
                      <span className="text-[11px] text-stone-300 font-medium">
                        {activeVideoModal.styleTag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                    {activeVideoModal.title}
                  </h3>
                  {activeVideoModal.caption && (
                    <p className="text-xs text-stone-400 mt-1 max-w-md">
                      {activeVideoModal.caption}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    handleCloseVideoModal();
                    handleBookStyle(e, activeVideoModal);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rosewood-600 to-rose-600 hover:from-rosewood-700 hover:to-rose-700 text-white text-xs font-bold shadow-lg transition-all"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Book This Exact Style</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Gallery Grid completed */}
      </div>
    </section>
  );
};
