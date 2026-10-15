import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { AppointmentCard } from './AppointmentCard';
import { BlockAvailabilityModal } from './BlockAvailabilityModal';
import { ManageServicesModal } from './ManageServicesModal';
import { ManagePortfolioModal } from './ManagePortfolioModal';
import PushNotificationSettingsModal from './PushNotificationSettingsModal';
import { AccountSettingsModal } from './AccountSettingsModal';
import InstallPromptModal from '../pwa/InstallPromptModal';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sliders,
  Camera,
  CalendarX,
  ChevronDown,
  X,
  RefreshCw,
  LogOut,
  CalendarClock,
  XCircle,
  Database,
  Bell,
  KeyRound,
} from 'lucide-react';

export const LynaDashboard = () => {
  const {
    appointments,
    appointmentsLoading,
    appointmentsError,
    fetchAppointments,
    setCurrentView,
    isLiveBackend,
  } = useBooking();
  const { signOut, user } = useAuth();
  const [filter, setFilter] = useState('all');

  // Modals for studio management
  const [showManageServicesModal, setShowManageServicesModal] = useState(false);
  const [showManagePortfolioModal, setShowManagePortfolioModal] = useState(false);
  const [showBlockAvailabilityModal, setShowBlockAvailabilityModal] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Status counts
  const pendingCount = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'new'
  ).length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const rescheduledCount = appointments.filter(
    (a) => a.status === 'reschedule_proposed'
  ).length;
  const rejectedCount = appointments.filter((a) => a.status === 'rejected').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const filteredAppointments = appointments.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'pending' || app.status === 'new';
    if (filter === 'confirmed') return app.status === 'confirmed';
    if (filter === 'reschedule_proposed') return app.status === 'reschedule_proposed';
    if (filter === 'rejected') return app.status === 'rejected';
    if (filter === 'completed') return app.status === 'completed';
    return true;
  });

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
            Studio Schedule and Reservations
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
            Braids by Helen — Studio Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Review customer bookings, confirm appointments, propose alternative slots, and contact clients on WhatsApp.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Schedule Button (AC 2) */}
          <button
            onClick={() => fetchAppointments()}
            disabled={appointmentsLoading}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-60"
            title="Refresh appointments from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                appointmentsLoading ? 'animate-spin' : ''
              }`}
            />
            <span>{appointmentsLoading ? 'Refreshing...' : 'Refresh Schedule'}</span>
          </button>

          {/* Return to Client View */}
          <button
            onClick={() => setCurrentView('customer')}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Client View</span>
          </button>

          {/* Manage Services Button */}
          <button
            onClick={() => setShowManageServicesModal(true)}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
            title="Manage services and pricing"
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>Services</span>
          </button>

          {/* Manage Portfolio Media Button */}
          <button
            onClick={() => setShowManagePortfolioModal(true)}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
            title="Upload and manage portfolio photos and videos"
          >
            <Camera className="w-3.5 h-3.5 text-rosewood-600" />
            <span>Portfolio</span>
          </button>

          {/* Push Notification Controls (Slice 4) */}
          <button
            onClick={() => setShowPushModal(true)}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
            title="Configure mobile and desktop push notifications"
          >
            <Bell className="w-3.5 h-3.5 text-rosewood" />
            <span>Push Alerts</span>
          </button>

          {/* Block Availability Button */}
          <button
            onClick={() => setShowBlockAvailabilityModal(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-soft transition-all flex items-center gap-1.5"
            title="Set unavailable hours"
          >
            <CalendarX className="w-3.5 h-3.5 text-accent" />
            <span>Unavailability</span>
          </button>

          {/* Security Credentials Button */}
          <button
            onClick={() => setShowAccountModal(true)}
            className="bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
            title="Change administrator login email and password"
          >
            <KeyRound className="w-3.5 h-3.5 text-rosewood-600" />
            <span>Security</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut()}
            className="bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-soft transition-all flex items-center gap-1.5"
            title="Sign out of admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>



      {/* Error Callout */}
      {appointmentsError && (
        <div className="mb-6 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>Error loading bookings: {appointmentsError}</span>
          <button
            onClick={() => fetchAppointments()}
            className="text-xs font-bold underline text-red-800 ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-soft">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900 font-mono">
            {appointments.length}
          </p>
          <span className="text-[11px] text-stone-500">All registered slots</span>
        </div>

        {/* Pending Requests */}
        <div
          className={`bg-white rounded-2xl p-4 border shadow-soft ${
            pendingCount > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-800 font-mono">
            {pendingCount}
          </p>
          <span className="text-[11px] text-amber-700">Awaiting confirmation</span>
        </div>

        {/* Confirmed Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-soft">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 font-mono">
            {confirmedCount}
          </p>
          <span className="text-[11px] text-emerald-700">Ready for styling</span>
        </div>

        {/* Rescheduled Proposals */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-soft">
          <div className="flex items-center justify-between text-sky-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Reschedule</span>
            <CalendarClock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-sky-800 font-mono">
            {rescheduledCount}
          </p>
          <span className="text-[11px] text-sky-700">Alternative proposed</span>
        </div>
      </div>

      {/* Mobile Filter Dropdown */}
      <div className="sm:hidden mb-5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Filter Appointments:
        </label>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-3 text-xs font-semibold text-stone-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-rosewood-500 appearance-none pr-10"
          >
            <option value="all">All Appointments ({appointments.length})</option>
            <option value="pending">Pending Review ({pendingCount})</option>
            <option value="confirmed">Confirmed ({confirmedCount})</option>
            <option value="reschedule_proposed">Reschedule Offered ({rescheduledCount})</option>
            <option value="rejected">Declined ({rejectedCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Filter Pills */}
      <div className="hidden sm:flex items-center gap-2 border-b border-stone-200 pb-3.5 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All ({appointments.length})
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Pending Review</span>
          <span className="bg-amber-200 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('confirmed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'confirmed'
              ? 'bg-emerald-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Confirmed ({confirmedCount})
        </button>

        <button
          onClick={() => setFilter('reschedule_proposed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'reschedule_proposed'
              ? 'bg-sky-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Rescheduled ({rescheduledCount})
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Declined ({rejectedCount})
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'completed'
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
          <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-stone-700">No appointments in this category</h3>
          <p className="text-xs text-stone-400 mt-1">Select another filter tab to view appointments.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAppointments.map((app) => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      )}

      {/* Manage Services Modal (Slice 3) */}
      <ManageServicesModal
        isOpen={showManageServicesModal}
        onClose={() => setShowManageServicesModal(false)}
      />

      {/* Manage Portfolio Modal (Slice 3) */}
      <ManagePortfolioModal
        isOpen={showManagePortfolioModal}
        onClose={() => setShowManagePortfolioModal(false)}
      />

      {/* Block Availability Management Modal (Slice 2) */}
      <BlockAvailabilityModal
        isOpen={showBlockAvailabilityModal}
        onClose={() => setShowBlockAvailabilityModal(false)}
      />

      {/* Push Notification Settings Modal (Slice 4) */}
      <PushNotificationSettingsModal
        isOpen={showPushModal}
        onClose={() => setShowPushModal(false)}
        onOpenInstallGuide={() => setShowInstallGuide(true)}
      />

      {/* Standalone Install Guide Modal (Slice 4) */}
      <InstallPromptModal
        forceOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
      />

      {/* Security Credentials & Password Modal */}
      <AccountSettingsModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
};
