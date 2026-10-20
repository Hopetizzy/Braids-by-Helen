import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Calendar,
  CheckCircle2,
  CalendarClock,
  XCircle,
  MessageSquare,
  Sliders,
  Camera,
  CalendarX,
  Bell,
  KeyRound,
  Search,
  ArrowRight,
  ExternalLink,
  Clock,
  AlertTriangle,
  Smartphone,
  ChevronRight,
  Check,
} from 'lucide-react';

export const AdminGuideModal = ({
  isOpen,
  onClose,
  onOpenServices,
  onOpenPortfolio,
  onOpenAvailability,
  onOpenPush,
  onOpenAccount,
}) => {
  const [activeTab, setActiveTab] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const topics = [
    {
      id: 'quickstart',
      title: 'Quick Start (2-Min Routine)',
      icon: Search,
      badge: 'Start Here',
      readTime: '2 min',
      description: 'Your simple 3-step daily routine to stay in control of bookings.',
    },
    {
      id: 'bookings',
      title: 'Managing Appointments',
      icon: Calendar,
      badge: 'Essential',
      readTime: '3 min',
      description: 'Confirm, reschedule, decline, or mark appointments completed.',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Automation',
      icon: MessageSquare,
      badge: 'Client Contact',
      readTime: '2 min',
      description: 'How instant messages are pre-written and sent to clients.',
    },
    {
      id: 'services',
      title: 'Services & Pricing (₦)',
      icon: Sliders,
      badge: 'Menu',
      readTime: '2 min',
      description: 'Add new styles, change prices in Naira, and adjust hours.',
      action: { label: 'Open Services Manager', onClick: onOpenServices },
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Media',
      icon: Camera,
      badge: 'Showcase',
      readTime: '2 min',
      description: 'Upload hair photos & videos, write captions, feature styles.',
      action: { label: 'Open Portfolio Manager', onClick: onOpenPortfolio },
    },
    {
      id: 'unavailability',
      title: 'Days Off & Blocked Hours',
      icon: CalendarX,
      badge: 'Schedule',
      readTime: '2 min',
      description: 'Block rest days, church hours, or vacations to avoid overlaps.',
      action: { label: 'Open Availability Manager', onClick: onOpenAvailability },
    },
    {
      id: 'push',
      title: 'Phone Alerts & Mobile App',
      icon: Bell,
      badge: 'Notifications',
      readTime: '2 min',
      description: 'Install the app on your phone and get alerts for new bookings.',
      action: { label: 'Open Push Settings', onClick: onOpenPush },
    },
    {
      id: 'security',
      title: 'Security & Login',
      icon: KeyRound,
      badge: 'Account',
      readTime: '1 min',
      description: 'Change your admin email, update your password, and stay safe.',
      action: { label: 'Open Security Settings', onClick: onOpenAccount },
    },
  ];

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div
        className="bg-cream-50 rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-guide-title"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-espresso-900 via-rosewood-900 to-espresso-950 text-white px-5 sm:px-8 py-5 flex items-center justify-between border-b border-rosewood-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Helen's Handbook
                </span>
                <span className="text-[11px] text-stone-300 hidden sm:inline">
                  • 5-Minute Quick Reference
                </span>
              </div>
              <h2
                id="admin-guide-title"
                className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Studio Admin Operations Guide
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Close guide"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Mobile Topic Selector */}
        <div className="bg-white px-5 sm:px-8 py-3.5 border-b border-stone-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guide (e.g. reschedule, price, photo, whatsapp)..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rosewood-500 focus:bg-white transition-all"
            />
          </div>

          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5 self-end sm:self-auto">
            <span>Need quick help? You can re-open this guide anytime via</span>
            <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-200">
              Admin Guide
            </span>
          </div>
        </div>

        {/* Main Content Area: Sidebar + Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 bg-stone-50 border-b md:border-b-0 md:border-r border-stone-200 overflow-x-auto md:overflow-y-auto p-2 sm:p-3 flex md:flex-col shrink-0 gap-1.5 md:gap-1">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTab === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTab(topic.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs whitespace-nowrap md:whitespace-normal shrink-0 md:shrink ${isActive
                    ? 'bg-rosewood-700 text-white font-bold shadow-sm ring-1 ring-rosewood-800'
                    : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-200/70 hover:text-stone-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-500'
                        }`}
                    />
                    <span
                      className={`truncate ${isActive ? 'text-white font-bold' : 'text-stone-700 font-semibold'
                        }`}
                    >
                      {topic.title}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 hidden md:block ${isActive ? 'text-amber-300' : 'text-stone-400'
                      }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Guide Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-white">
            {/* TAB 1: QUICK START */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    How to Run Your Studio Every Day
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Managing your salon is easy! Follow these three quick steps every day to keep clients happy and appointments organized.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3.5">
                  <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center mb-2.5 shadow-sm">
                        1
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">Morning Check</h4>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        Tap <span className="font-bold text-amber-800">Pending Review</span> tab. If there are new bookings, click <span className="font-bold text-emerald-700">Confirm</span> or <span className="font-bold text-sky-700">Reschedule</span>.
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-3">
                      Takes 1 minute
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2.5 shadow-sm">
                        2
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">During the Day</h4>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        Look at <span className="font-bold text-emerald-800">Confirmed</span> bookings to see who is arriving next, their chosen braid style, and any notes.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-3">
                      Check anytime
                    </span>
                  </div>

                  <div className="bg-stone-100/70 border border-stone-300 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mb-2.5 shadow-sm">
                        3
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">After the Braiding</h4>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        When you finish styling, tap <span className="font-bold text-stone-900">Mark Completed</span>. Your calendar stays clean and ready for tomorrow!
                      </p>
                    </div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-3">
                      Takes 10 seconds
                    </span>
                  </div>
                </div>

                {/* KPI Cards Explanation */}
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Understanding the Numbers at the Top of Your Screen
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Bookings</span>
                      <span className="text-stone-800 font-bold text-xs">All records</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-300">
                      <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Review</span>
                      <span className="text-amber-800 font-bold text-xs">Waiting for Helen</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-300">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Confirmed</span>
                      <span className="text-emerald-800 font-bold text-xs">Locked in schedule</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-sky-300">
                      <span className="text-[10px] uppercase font-bold text-sky-600 block">Reschedule</span>
                      <span className="text-sky-800 font-bold text-xs">Waiting client reply</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGING APPOINTMENTS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Step-by-Step Booking Management</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Confirming, Rescheduling & Declining Bookings
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Whenever a client books on your website, their appointment appears under <strong className="text-stone-800">Pending Review</strong>. Here is how to handle each one:
                  </p>
                </div>

                {/* Action 1: Confirm */}
                <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-4.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Appointment</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800">When you are free at that time</span>
                  </div>
                  <ol className="text-xs text-stone-700 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Click the green <strong className="text-emerald-700">Confirm</strong> button on the booking card.</li>
                    <li>The system locks the date and slot in your calendar so no one else can book it.</li>
                    <li>WhatsApp will automatically open with a ready-made confirmation message containing the appointment date, time, and service. Tap <strong>Send</strong> in WhatsApp to notify the client!</li>
                  </ol>
                </div>

                {/* Action 2: Reschedule */}
                <div className="border border-sky-200 bg-sky-50/30 rounded-2xl p-4.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </span>
                    <span className="text-xs font-bold text-sky-800">When you need a different time</span>
                  </div>
                  <ol className="text-xs text-stone-700 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Click the blue <strong className="text-sky-700">Reschedule</strong> button.</li>
                    <li>Pick a <strong>new proposed date</strong> and <strong>time slot</strong> that works better for you.</li>
                    <li>Add an optional friendly note (e.g. <em>"Hi dear, I am fully booked in the morning, how about 2:00 PM?"</em>).</li>
                    <li>Click <strong>Send Reschedule Proposal</strong>. WhatsApp opens with the message ready to send!</li>
                  </ol>
                </div>

                {/* Action 3: Decline */}
                <div className="border border-rose-200 bg-rose-50/30 rounded-2xl p-4.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </span>
                    <span className="text-xs font-bold text-rose-800">When you cannot take this booking</span>
                  </div>
                  <ol className="text-xs text-stone-700 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Click the red <strong className="text-rose-700">Decline</strong> button.</li>
                    <li>Choose a polite reason (e.g., <em>Fully Booked</em>, <em>Salon Closed</em>, or <em>Emergency</em>).</li>
                    <li>Submit. WhatsApp opens with a polite, professional apology note ready to send.</li>
                  </ol>
                </div>

                {/* Conflict Notice */}
                <div className="border border-amber-300 bg-amber-50 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h5 className="font-bold text-amber-900">What if a Red Warning Banner Appears?</h5>
                    <p className="text-amber-800 mt-1 leading-relaxed">
                      If two clients try to book the exact same slot, or if you previously blocked that time off, the dashboard displays a warning banner. Simply propose a new slot using <strong>Reschedule</strong> to avoid double-booking!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Direct Communication</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    How Client Messaging Works
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    The system automatically takes care of phone formatting (+234 Nigerian numbers) and creates pre-written professional salon messages for you.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      1. Automatic WhatsApp Launch
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      When you click <strong>Confirm</strong>, <strong>Reschedule</strong>, or <strong>Decline</strong>, WhatsApp opens in a new browser tab or launches your WhatsApp app. You don't have to type anything—just tap <strong>Send</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      2. Direct "Chat on WhatsApp" Button
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Need to ask the client about their hair length, hair color, or extensions? Click the green <strong>WhatsApp</strong> button on any card to immediately open a chat with that client.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      3. Pro-Tip: If WhatsApp Doesn't Pop Up
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      If your phone or browser blocks pop-ups, you will see a notice on your screen saying <em>"Open WhatsApp Chat"</em>. Just tap that link directly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SERVICES & PRICING */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rosewood-800 bg-rosewood-50 px-2.5 py-1 rounded-full border border-rosewood-200 mb-2">
                    <Sliders className="w-3.5 h-3.5 text-rosewood-600" />
                    <span>Salon Catalog</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Adding & Editing Services & Pricing
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Keep your price list up to date, add trendy new hairstyles, or adjust styling duration anytime.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-stone-700">
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rosewood text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Open Services Manager</strong>
                      <p className="text-stone-600 mt-0.5">Click the <strong>Services</strong> button at the top of your dashboard.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rosewood text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">To Change a Price or Duration</strong>
                      <p className="text-stone-600 mt-0.5">Find the service in the list, tap <strong>Edit</strong>, change the price in ₦ or duration in hours, and click <strong>Save Changes</strong>.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rosewood text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">To Add a Brand New Hairstyle</strong>
                      <p className="text-stone-600 mt-0.5">Click <strong>+ Add New Service</strong> at the top, enter the style name (e.g. <em>French Curl Braids</em>), price, category, and styling duration.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenServices}
                    className="w-full sm:w-auto bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <Sliders className="w-4 h-4 text-amber-300" />
                    <span>Open Services Manager Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: PORTFOLIO & MEDIA */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rosewood-800 bg-rosewood-50 px-2.5 py-1 rounded-full border border-rosewood-200 mb-2">
                    <Camera className="w-3.5 h-3.5 text-rosewood-600" />
                    <span>Gallery & Showcases</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Uploading & Managing Hair Portfolio
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Show prospective clients your best work! Add new photos and videos directly from your phone or laptop.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-stone-700">
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-espresso-800 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Upload Photo or Video</strong>
                      <p className="text-stone-600 mt-0.5">Tap <strong>Upload Media</strong>, pick photos or video clips from your gallery or camera.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-espresso-800 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Add Tags & Style Names</strong>
                      <p className="text-stone-600 mt-0.5">Tag with styles like <em>Knotless</em>, <em>Boho</em>, <em>Box Braids</em>, or <em>Twists</em> so clients can filter easily on your site.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-espresso-800 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Featured on Homepage</strong>
                      <p className="text-stone-600 mt-0.5">Toggle the star icon ⭐ to make that photo appear directly on the front page of your website.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenPortfolio}
                    className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>Open Portfolio Manager Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: UNAVAILABILITY & DAYS OFF */}
            {activeTab === 'unavailability' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300 mb-2">
                    <CalendarX className="w-3.5 h-3.5 text-stone-600" />
                    <span>Schedule Control</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Blocking Days Off & Personal Hours
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Going for church, traveling, resting, or booked through another channel? Block your schedule so clients cannot pick those times.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-stone-700">
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      Day
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Block a Full Day</strong>
                      <p className="text-stone-600 mt-0.5">Select a date (e.g. Sunday or a public holiday), leave time slot empty, and click <strong>Block Date</strong>. The entire day is grayed out for clients.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      Slot
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Block Specific Hours Only</strong>
                      <p className="text-stone-600 mt-0.5">Select a date and pick a specific time slot (e.g. 09:00 AM - 01:00 PM). Only that slot will be blocked; the rest of the day stays open for bookings!</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      Free
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Unblock When Your Schedule Clears</strong>
                      <p className="text-stone-600 mt-0.5">Plans changed? Scroll down to the list of blocked dates, tap the red trash can 🗑️ icon, and that slot becomes instantly bookable again.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenAvailability}
                    className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <CalendarX className="w-4 h-4 text-amber-300" />
                    <span>Open Availability Manager Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: PUSH NOTIFICATIONS & MOBILE */}
            {activeTab === 'push' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rosewood-800 bg-rosewood-50 px-2.5 py-1 rounded-full border border-rosewood-200 mb-2">
                    <Bell className="w-3.5 h-3.5 text-rosewood-600" />
                    <span>Instant Alerts</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Phone Alerts & Adding App to Home Screen
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Never miss a client! Set up instant ring/vibration alerts whenever a new booking arrives.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <Smartphone className="w-4 h-4 text-rosewood" />
                      <span>Add to Phone Home Screen</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      <strong>iPhone:</strong> Open site in Safari, tap the Share icon (<ExternalLink className="w-3 h-3 inline" />), then tap <strong>"Add to Home Screen"</strong>.<br />
                      <strong>Android:</strong> Open in Chrome, tap the 3 dots menu, then tap <strong>"Install App"</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <Bell className="w-4 h-4 text-rosewood" />
                      <span>Turn On Push Notifications</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Tap the <strong>Push Alerts</strong> button in your dashboard, then click <strong>Enable Push Notifications</strong>. When prompted by your phone, tap <strong>Allow</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenPush}
                    className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span>Open Push Notification Settings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 8: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300 mb-2">
                    <KeyRound className="w-3.5 h-3.5 text-stone-600" />
                    <span>Admin Security</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Changing Login Email & Password
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    Protect your salon records by keeping your login details private and secure.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-stone-700">
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Change Password</strong>
                      <p className="text-stone-600 mt-0.5">Click <strong>Security</strong> in your header, enter your new password twice, and tap <strong>Update Password</strong>.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-stone-900 block font-semibold">Sign Out When Finished on Shared Devices</strong>
                      <p className="text-stone-600 mt-0.5">If you use a computer at a salon or cyber cafe, always click <strong>Sign Out</strong> when you finish.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenAccount}
                    className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-amber-300" />
                    <span>Open Security & Password Modal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-stone-50 px-5 sm:px-8 py-3.5 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500 hidden sm:block">
            Tip: Bookmark this dashboard on your phone browser for instant 1-tap access.
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-soft transition-all ml-auto"
          >
            Got it, Let's Manage!
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminGuideModal;
