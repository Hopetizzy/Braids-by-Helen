import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { SERVICES } from '../data/servicesData';
import { INITIAL_MEDIA } from '../data/initialMedia';
import { INITIAL_APPOINTMENTS } from '../data/initialAppointments';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { sanitizeNigerianPhone } from '../utils/whatsappTemplates';
import {
  formatDateIso,
  formatDisplayDate,
  isDateAllDayBlocked,
  isSlotUnavailable,
  isDateFullyBooked,
} from '../utils/dateUtils';
import { notifyBookingCreated } from '../services/pushNotificationService';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { isAdmin } = useAuth();

  // Navigation and View State
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'business'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Services State with live database fallback
  const [services, setServices] = useState(() => {
    try {
      localStorage.removeItem('bbh_cached_services');
      localStorage.removeItem('bbh_cached_services_v2');
      const cached = localStorage.getItem('bbh_cached_services_v3');
      if (cached) return JSON.parse(cached);
    } catch {}
    return SERVICES.map(item => {
      const numericPrice = parseInt(item.priceEstimate.replace(/[^0-9]/g, ''), 10) || 5000;
      return {
        ...item,
        dbId: item.id,
        slug: item.id,
        durationEstimate: item.duration,
        startingPrice: numericPrice,
        isActive: true,
        imageUrl: item.image,
      };
    });
  });
  const [servicesLoading, setServicesLoading] = useState(false);

  // Portfolio Media State
  const [media, setMedia] = useState(() => {
    try {
      const cached = localStorage.getItem('bbh_portfolio_media');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_MEDIA;
  });
  const [mediaLoading, setMediaLoading] = useState(false);

  // Availability & Schedule Controls State (Slice 2)
  const [publicSchedule, setPublicSchedule] = useState(() => {
    try {
      const cached = localStorage.getItem('bbh_public_schedule');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [adminAvailability, setAdminAvailability] = useState(() => {
    try {
      const cached = localStorage.getItem('bbh_admin_availability');
      if (cached) return JSON.parse(cached);
    } catch {}
    const mockDate1 = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
    const mockDate2 = new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0];
    return [
      {
        id: 'avail-seed-1',
        unavailable_date: mockDate1,
        is_all_day: true,
        blocked_slots: [],
        reason: 'Studio Deep Cleaning',
      },
      {
        id: 'avail-seed-2',
        unavailable_date: mockDate2,
        is_all_day: false,
        blocked_slots: ['10:30 AM', '11:30 AM'],
        reason: 'Staff Training',
      },
    ];
  });
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Service, 2: Date, 3: Time, 4: Details, 5: Success
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Active Booking Form State
  const [bookingData, setBookingData] = useState({
    service: SERVICES[0],
    styleChoice: SERVICES[0]?.styles[0] || '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    formattedDate: 'Tomorrow, ' + new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    time: '10:30 AM',
    timePeriod: 'morning',
    fullName: '',
    phone: '',
    note: '',
  });

  // Last confirmed booking for modal success view
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Business Manager Appointments List with local cache persistence
  const [appointments, setAppointments] = useState(() => {
    try {
      const cached = localStorage.getItem('bbh_cached_appointments');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_APPOINTMENTS;
  });
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  // Helper to persist appointments changes to localStorage
  const updateAndPersistAppointments = useCallback((updater) => {
    setAppointments(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('bbh_cached_appointments', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Fetch services dynamically from Supabase database table or local cache
  const fetchServices = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        setServicesLoading(true);
        const query = supabase
          .from('services')
          .select('*')
          .order('display_order', { ascending: true });

        if (!isAdmin) {
          query.eq('is_active', true);
        }

        let { data, error } = await query;
        if (error) throw error;

        // Auto heal: Check if database has legacy or outdated seed services
        const isLegacy =
          data &&
          data.some(
            item =>
              item.slug === 'wigs-revamp' ||
              item.slug === 'ghana-weaving' ||
              item.slug === 'ghana-weaving-shuku' ||
              item.slug === 'ghana-weaving-allback' ||
              item.slug === 'twists-passion' ||
              item.slug === 'threading-african' ||
              item.slug === 'natural-silkpress' ||
              item.slug === 'children-styling'
          );

        // If table is empty or has outdated legacy services, sync Helen's 6 services directly to database
        if (isLegacy || !data || data.length === 0) {
          try {
            if (isLegacy) {
              await supabase.from('services').delete().neq('slug', 'NONE');
            }

            const helenDatabaseRows = SERVICES.map((item, idx) => ({
              id: `00000000-0000-0000-0000-00000000000${idx + 1}`,
              slug: item.id,
              category: item.category,
              name: item.name,
              subtitle: item.subtitle,
              description: item.description,
              starting_price: parseInt(item.priceEstimate.replace(/[^0-9]/g, ''), 10) || 5000,
              duration_estimate: item.duration,
              styles: item.styles,
              image_url: item.image,
              tag: item.tag || null,
              is_popular: Boolean(item.popular),
              is_active: true,
              display_order: idx + 1,
            }));

            await supabase.from('services').upsert(helenDatabaseRows, { onConflict: 'slug' });

            const { data: freshData } = await supabase
              .from('services')
              .select('*')
              .order('display_order', { ascending: true });

            if (freshData && freshData.length > 0) {
              data = freshData;
            }
          } catch (syncErr) {
            console.warn('Auto sync services notice:', syncErr.message);
          }
        }

        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.slug || item.id,
            dbId: item.id,
            slug: item.slug || item.id,
            category: item.category,
            name: item.name,
            subtitle: item.subtitle,
            description: item.description,
            duration: item.duration_estimate,
            durationEstimate: item.duration_estimate,
            startingPrice: Number(item.starting_price) || 0,
            priceEstimate: `From ₦${Number(item.starting_price).toLocaleString()}`,
            popular: Boolean(item.is_popular),
            isActive: Boolean(item.is_active),
            styles: Array.isArray(item.styles) ? item.styles : [],
            image: item.image_url || '/images/knotless-braids.png',
            imageUrl: item.image_url || '/images/knotless-braids.png',
            tag: item.tag,
            displayOrder: item.display_order || 0,
          }));
          setServices(mapped);
          try {
            localStorage.setItem('bbh_cached_services_v3', JSON.stringify(mapped));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn('Could not fetch services from Supabase, using local state:', err.message);
      } finally {
        setServicesLoading(false);
      }
    }

    try {
      const cached = localStorage.getItem('bbh_cached_services_v3');
      if (cached) {
        setServices(JSON.parse(cached));
      }
    } catch {}
  }, [isAdmin]);

  // Fetch portfolio media from Supabase or local storage
  const fetchMedia = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        setMediaLoading(true);
        const query = supabase
          .from('media')
          .select('*')
          .order('display_order', { ascending: true });

        if (!isAdmin) {
          query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map(m => ({
            id: m.id,
            mediaType: m.media_type,
            media_type: m.media_type,
            publicUrl: m.public_url,
            public_url: m.public_url,
            storagePath: m.storage_path,
            storage_path: m.storage_path,
            title: m.title || '',
            caption: m.caption || '',
            category: m.category || 'braids',
            serviceId: m.service_id,
            service_id: m.service_id,
            styleTag: m.style_tag || '',
            style_tag: m.style_tag || '',
            isPublished: Boolean(m.is_published),
            is_published: Boolean(m.is_published),
            displayOrder: m.display_order || 0,
            display_order: m.display_order || 0,
            createdAt: m.created_at,
          }));
          setMedia(mapped);
          try {
            localStorage.setItem('bbh_portfolio_media', JSON.stringify(mapped));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn('Could not fetch media from Supabase, using local initial media:', err.message);
      } finally {
        setMediaLoading(false);
      }
    }

    try {
      const cached = localStorage.getItem('bbh_portfolio_media');
      if (cached) {
        setMedia(JSON.parse(cached));
        return;
      }
    } catch {}
    setMedia(INITIAL_MEDIA);
  }, [isAdmin]);

  // Initial services and media load
  useEffect(() => {
    fetchServices();
    fetchMedia();
  }, [fetchServices, fetchMedia]);

  // Fetch live appointments from Supabase for authenticated admin
  const fetchAppointments = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !isAdmin) {
      return;
    }

    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(b => {
          const rawStatus = (b.status || 'PENDING').toLowerCase();
          // Normalize status representation for frontend filters
          let normalizedStatus = rawStatus;
          if (rawStatus === 'pending') normalizedStatus = 'pending';
          if (rawStatus === 'confirmed') normalizedStatus = 'confirmed';
          if (rawStatus === 'reschedule_proposed') normalizedStatus = 'reschedule_proposed';
          if (rawStatus === 'rejected') normalizedStatus = 'rejected';
          if (rawStatus === 'completed') normalizedStatus = 'completed';

          return {
            id: b.id,
            bookingReference: b.booking_reference,
            customerName: b.customer_name,
            phone: b.customer_phone,
            whatsappClean: b.customer_phone_clean,
            serviceId: b.service_id,
            serviceName: b.service_name,
            styleChoice: b.style_choice || '',
            date: b.booking_date,
            dateIso: b.booking_date,
            time: b.time_slot,
            timePeriod: b.time_period,
            status: normalizedStatus,
            dbStatus: b.status,
            proposedDate: b.proposed_date,
            proposedTimeSlot: b.proposed_time_slot,
            rejectionReason: b.rejection_reason,
            note: b.customer_note || 'None provided',
            createdAt: b.created_at
              ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recent',
            source: 'Online Booking',
          };
        });

        updateAndPersistAppointments(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch bookings from Supabase:', err.message);
      setAppointmentsError(err.message);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [isAdmin, updateAndPersistAppointments]);

  // Fetch public schedule (aggregating closures, blocked slots, and confirmed bookings)
  const fetchPublicSchedule = useCallback(async () => {
    const today = new Date();
    const startDate = formatDateIso(today);
    const future = new Date(today);
    future.setDate(today.getDate() + 30);
    const endDate = formatDateIso(future);

    if (isSupabaseConfigured && supabase) {
      try {
        setScheduleLoading(true);
        const { data, error } = await supabase.rpc('get_public_schedule', {
          p_start_date: startDate,
          p_end_date: endDate,
        });

        if (error) throw error;
        if (data && Array.isArray(data)) {
          setPublicSchedule(data);
          try {
            localStorage.setItem('bbh_public_schedule', JSON.stringify(data));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn('Could not fetch public schedule from RPC, using local compilation:', err.message);
      } finally {
        setScheduleLoading(false);
      }
    }

    // Local compilation fallback for offline/demo mode
    const compiled = [];
    const dateMap = new Map();

    adminAvailability.forEach(item => {
      dateMap.set(item.unavailable_date, {
        date: item.unavailable_date,
        is_all_day: Boolean(item.is_all_day),
        reason: item.reason || '',
        blocked_slots: Array.isArray(item.blocked_slots) ? [...item.blocked_slots] : [],
      });
    });

    appointments
      .filter(a => a.status === 'confirmed')
      .forEach(a => {
        const d = a.dateIso || a.date;
        if (!d) return;
        if (!dateMap.has(d)) {
          dateMap.set(d, {
            date: d,
            is_all_day: false,
            reason: '',
            blocked_slots: [a.time],
          });
        } else {
          const entry = dateMap.get(d);
          if (!entry.blocked_slots.includes(a.time)) {
            entry.blocked_slots.push(a.time);
          }
        }
      });

    dateMap.forEach(value => compiled.push(value));
    setPublicSchedule(compiled);
    try {
      localStorage.setItem('bbh_public_schedule', JSON.stringify(compiled));
    } catch {}
  }, [adminAvailability, appointments]);

  // Fetch admin availability records from Supabase
  const fetchAdminAvailability = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !isAdmin) return;

    try {
      setAvailabilityLoading(true);
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('unavailable_date', { ascending: true });

      if (error) throw error;
      if (data) {
        setAdminAvailability(data);
        try {
          localStorage.setItem('bbh_admin_availability', JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.warn('Could not fetch admin availability:', err.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [isAdmin]);

  // Block an entire calendar date
  const blockDate = async (dateIso, reason = '') => {
    if (!dateIso) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('availability')
        .upsert(
          {
            unavailable_date: dateIso,
            is_all_day: true,
            reason: reason || 'Salon closed',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'unavailable_date' }
        );
      if (error) console.error('Supabase blockDate error:', error);
    }

    setAdminAvailability(prev => {
      const existingIdx = prev.findIndex(a => a.unavailable_date === dateIso);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          is_all_day: true,
          reason: reason || 'Salon closed',
        };
      } else {
        updated = [
          ...prev,
          {
            id: `avail-${Date.now()}`,
            unavailable_date: dateIso,
            is_all_day: true,
            blocked_slots: [],
            reason: reason || 'Salon closed',
          },
        ];
      }
      try {
        localStorage.setItem('bbh_admin_availability', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchPublicSchedule();
  };

  // Re-open an entire calendar date
  const unblockDate = async (dateIso) => {
    if (!dateIso) return;

    if (isSupabaseConfigured && supabase) {
      const existing = adminAvailability.find(a => a.unavailable_date === dateIso);
      if (existing && existing.blocked_slots && existing.blocked_slots.length > 0) {
        await supabase
          .from('availability')
          .update({ is_all_day: false, reason: '' })
          .eq('unavailable_date', dateIso);
      } else {
        await supabase
          .from('availability')
          .delete()
          .eq('unavailable_date', dateIso);
      }
    }

    setAdminAvailability(prev => {
      const updated = prev
        .map(a => (a.unavailable_date === dateIso ? { ...a, is_all_day: false } : a))
        .filter(a => a.is_all_day || (a.blocked_slots && a.blocked_slots.length > 0));
      try {
        localStorage.setItem('bbh_admin_availability', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchPublicSchedule();
  };

  // Block a specific time slot on a date
  const blockSlot = async (dateIso, slotTime, reason = '') => {
    if (!dateIso || !slotTime) return;

    const existing = adminAvailability.find(a => a.unavailable_date === dateIso);
    const currentSlots = existing?.blocked_slots || [];
    if (currentSlots.includes(slotTime)) return;

    const updatedSlots = [...currentSlots, slotTime];

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('availability')
        .upsert(
          {
            unavailable_date: dateIso,
            is_all_day: existing?.is_all_day || false,
            blocked_slots: updatedSlots,
            reason: reason || existing?.reason || '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'unavailable_date' }
        );
    }

    setAdminAvailability(prev => {
      const idx = prev.findIndex(a => a.unavailable_date === dateIso);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], blocked_slots: updatedSlots };
      } else {
        updated = [
          ...prev,
          {
            id: `avail-${Date.now()}`,
            unavailable_date: dateIso,
            is_all_day: false,
            blocked_slots: updatedSlots,
            reason,
          },
        ];
      }
      try {
        localStorage.setItem('bbh_admin_availability', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchPublicSchedule();
  };

  // Unblock a specific time slot on a date
  const unblockSlot = async (dateIso, slotTime) => {
    if (!dateIso || !slotTime) return;

    const existing = adminAvailability.find(a => a.unavailable_date === dateIso);
    if (!existing) return;

    const updatedSlots = (existing.blocked_slots || []).filter(s => s !== slotTime);

    if (isSupabaseConfigured && supabase) {
      if (!existing.is_all_day && updatedSlots.length === 0) {
        await supabase
          .from('availability')
          .delete()
          .eq('unavailable_date', dateIso);
      } else {
        await supabase
          .from('availability')
          .update({
            blocked_slots: updatedSlots,
            updated_at: new Date().toISOString(),
          })
          .eq('unavailable_date', dateIso);
      }
    }

    setAdminAvailability(prev => {
      const updated = prev
        .map(a => (a.unavailable_date === dateIso ? { ...a, blocked_slots: updatedSlots } : a))
        .filter(a => a.is_all_day || (a.blocked_slots && a.blocked_slots.length > 0));
      try {
        localStorage.setItem('bbh_admin_availability', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchPublicSchedule();
  };

  // Detect conflicts for an appointment (AC 6)
  const getAppointmentConflict = useCallback((appointment) => {
    if (!appointment || (appointment.status !== 'pending' && appointment.status !== 'new')) {
      return null;
    }

    const dateIso = appointment.dateIso || appointment.date;
    const timeSlot = appointment.time;

    // 1. Check if date is all day blocked by Helen
    const dateBlock = adminAvailability.find(a => a.unavailable_date === dateIso && a.is_all_day);
    if (dateBlock) {
      return {
        hasConflict: true,
        type: 'date_closed',
        title: 'Date Closed',
        message: `Date is closed for ${dateBlock.reason || 'salon schedule'}.`,
        reason: dateBlock.reason || 'Salon closed',
      };
    }

    // 2. Check if time slot is blocked by Helen
    const slotBlock = adminAvailability.find(
      a => a.unavailable_date === dateIso && Array.isArray(a.blocked_slots) && a.blocked_slots.includes(timeSlot)
    );
    if (slotBlock) {
      return {
        hasConflict: true,
        type: 'slot_blocked',
        title: 'Slot Blocked',
        message: `Time slot ${timeSlot} is blocked by Helen (${slotBlock.reason || 'Unavailable'}).`,
        reason: slotBlock.reason || 'Slot blocked',
      };
    }

    // 3. Check if another confirmed appointment already occupies this slot
    const confirmedClash = appointments.find(
      a =>
        a.id !== appointment.id &&
        a.status === 'confirmed' &&
        (a.dateIso === dateIso || a.date === dateIso) &&
        a.time === timeSlot
    );
    if (confirmedClash) {
      return {
        hasConflict: true,
        type: 'double_booked',
        title: 'Double Booking Conflict',
        message: `Already confirmed for ${confirmedClash.customerName} (${confirmedClash.bookingReference}).`,
        collidingBooking: confirmedClash,
      };
    }

    return null;
  }, [adminAvailability, appointments]);

  // Initial schedule load
  useEffect(() => {
    fetchPublicSchedule();
  }, [fetchPublicSchedule]);

  // Trigger appointment and availability load when navigating to business dashboard or when admin logs in
  useEffect(() => {
    if (currentView === 'business' && isAdmin) {
      fetchAppointments();
      fetchAdminAvailability();
    }
  }, [currentView, isAdmin, fetchAppointments, fetchAdminAvailability]);

  // Save or update an existing service
  const saveService = async (servicePayload) => {
    const updatedStartingPrice = Number(servicePayload.startingPrice) || 0;
    const priceEst = `From ₦${updatedStartingPrice.toLocaleString()}`;
    const durationEst = servicePayload.durationEstimate || servicePayload.duration || '2 - 3 hrs';

    const cleanService = {
      ...servicePayload,
      startingPrice: updatedStartingPrice,
      priceEstimate: priceEst,
      duration: durationEst,
      durationEstimate: durationEst,
      styles: Array.isArray(servicePayload.styles) ? servicePayload.styles : [],
      isActive: servicePayload.isActive !== false,
      popular: Boolean(servicePayload.popular),
      image: servicePayload.imageUrl || servicePayload.image || '/images/knotless-braids.png',
      imageUrl: servicePayload.imageUrl || servicePayload.image || '/images/knotless-braids.png',
    };

    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        name: cleanService.name,
        category: cleanService.category,
        subtitle: cleanService.subtitle || '',
        description: cleanService.description || '',
        starting_price: updatedStartingPrice,
        duration_estimate: durationEst,
        styles: cleanService.styles,
        image_url: cleanService.imageUrl,
        tag: cleanService.tag || null,
        is_popular: cleanService.popular,
        is_active: cleanService.isActive,
        updated_at: new Date().toISOString(),
      };

      const matchId = cleanService.dbId || cleanService.id;
      const { error } = await supabase
        .from('services')
        .update(dbPayload)
        .eq('id', matchId);

      if (error) {
        console.error('Failed to update service in Supabase:', error.message);
        throw error;
      }
    }

    setServices(prev => {
      const updated = prev.map(s => (s.id === cleanService.id || s.dbId === cleanService.dbId ? cleanService : s));
      try {
        localStorage.setItem('bbh_cached_services', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Create a brand new service
  const createService = async (servicePayload) => {
    const slug = servicePayload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `service-${Date.now().toString().slice(-4)}`;

    const updatedStartingPrice = Number(servicePayload.startingPrice) || 0;
    const durationEst = servicePayload.durationEstimate || servicePayload.duration || '2 - 3 hrs';
    let newDbId = `service-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        slug,
        name: servicePayload.name,
        category: servicePayload.category || 'braids',
        subtitle: servicePayload.subtitle || '',
        description: servicePayload.description || '',
        starting_price: updatedStartingPrice,
        duration_estimate: durationEst,
        styles: Array.isArray(servicePayload.styles) ? servicePayload.styles : [],
        image_url: servicePayload.imageUrl || servicePayload.image || '/images/knotless-braids.png',
        tag: servicePayload.tag || null,
        is_popular: Boolean(servicePayload.popular),
        is_active: servicePayload.isActive !== false,
        display_order: services.length + 1,
      };

      const { data, error } = await supabase
        .from('services')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Failed to insert service into Supabase:', error.message);
        throw error;
      }
      if (data) newDbId = data.id;
    }

    const newService = {
      ...servicePayload,
      id: slug,
      dbId: newDbId,
      slug,
      startingPrice: updatedStartingPrice,
      priceEstimate: `From ₦${updatedStartingPrice.toLocaleString()}`,
      duration: durationEst,
      durationEstimate: durationEst,
      styles: Array.isArray(servicePayload.styles) ? servicePayload.styles : [],
      isActive: servicePayload.isActive !== false,
      popular: Boolean(servicePayload.popular),
      image: servicePayload.imageUrl || servicePayload.image || '/images/knotless-braids.png',
      imageUrl: servicePayload.imageUrl || servicePayload.image || '/images/knotless-braids.png',
    };

    setServices(prev => {
      const updated = [...prev, newService];
      try {
        localStorage.setItem('bbh_cached_services', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return newService;
  };

  // Toggle active/inactive for a service
  const toggleServiceActive = async (serviceId) => {
    const target = services.find(s => s.id === serviceId || s.dbId === serviceId);
    if (!target) return;

    const newActiveState = !target.isActive;
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('services')
        .update({ is_active: newActiveState, updated_at: new Date().toISOString() })
        .eq('id', target.dbId || target.id);
    }

    setServices(prev => {
      const updated = prev.map(s =>
        s.id === serviceId || s.dbId === serviceId ? { ...s, isActive: newActiveState } : s
      );
      try {
        localStorage.setItem('bbh_cached_services', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Upload photo or video to Supabase Storage salon-media bucket
  const uploadMediaFile = async (file) => {
    if (!file) throw new Error('No file provided');

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      throw new Error('Unsupported file format. Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM).');
    }

    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      const limitMb = isVideo ? '50MB' : '10MB';
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum ${limitMb} limit.`);
    }

    if (isSupabaseConfigured && supabase) {
      const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `uploads/${Date.now()}_${cleanBaseName}.${ext}`;

      const { data, error } = await supabase.storage
        .from('salon-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage upload error:', error.message);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('salon-media')
        .getPublicUrl(filePath);

      return {
        publicUrl: publicUrlData.publicUrl,
        storagePath: filePath,
        mediaType: isVideo ? 'video' : 'image',
      };
    }

    // Local / Offline demo mode mock URL
    const objectUrl = URL.createObjectURL(file);
    return {
      publicUrl: objectUrl,
      storagePath: `local/${file.name}`,
      mediaType: isVideo ? 'video' : 'image',
    };
  };

  // Save or add a media record to PostgreSQL & state
  const saveMediaItem = async (mediaPayload) => {
    let newId = mediaPayload.id || `media-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        media_type: mediaPayload.mediaType || mediaPayload.media_type || 'image',
        public_url: mediaPayload.publicUrl || mediaPayload.public_url,
        storage_path: mediaPayload.storagePath || mediaPayload.storage_path || 'uploads/file',
        title: mediaPayload.title || '',
        caption: mediaPayload.caption || '',
        category: mediaPayload.category || 'braids',
        service_id: mediaPayload.serviceId || mediaPayload.service_id || null,
        style_tag: mediaPayload.styleTag || mediaPayload.style_tag || null,
        is_published: mediaPayload.isPublished !== false,
        display_order: mediaPayload.displayOrder || media.length + 1,
      };

      if (mediaPayload.id && !mediaPayload.id.startsWith('media-seed-') && !mediaPayload.id.startsWith('media-')) {
        const { error } = await supabase
          .from('media')
          .update(dbPayload)
          .eq('id', mediaPayload.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('media')
          .insert(dbPayload)
          .select()
          .single();
        if (error) throw error;
        if (data) newId = data.id;
      }
    }

    const cleanItem = {
      ...mediaPayload,
      id: newId,
      mediaType: mediaPayload.mediaType || mediaPayload.media_type || 'image',
      publicUrl: mediaPayload.publicUrl || mediaPayload.public_url,
      storagePath: mediaPayload.storagePath || mediaPayload.storage_path,
      isPublished: mediaPayload.isPublished !== false,
      category: mediaPayload.category || 'braids',
      serviceId: mediaPayload.serviceId || mediaPayload.service_id || null,
      styleTag: mediaPayload.styleTag || mediaPayload.style_tag || '',
      displayOrder: mediaPayload.displayOrder || media.length + 1,
    };

    setMedia(prev => {
      const exists = prev.some(m => m.id === cleanItem.id);
      const updated = exists ? prev.map(m => (m.id === cleanItem.id ? cleanItem : m)) : [cleanItem, ...prev];
      try {
        localStorage.setItem('bbh_portfolio_media', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return cleanItem;
  };

  // Delete media item from storage and database
  const deleteMediaItem = async (mediaId, storagePath) => {
    if (isSupabaseConfigured && supabase) {
      if (storagePath && !storagePath.startsWith('seed/')) {
        await supabase.storage.from('salon-media').remove([storagePath]);
      }
      await supabase.from('media').delete().eq('id', mediaId);
    }

    setMedia(prev => {
      const updated = prev.filter(m => m.id !== mediaId);
      try {
        localStorage.setItem('bbh_portfolio_media', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle media published state
  const toggleMediaPublished = async (mediaId) => {
    const target = media.find(m => m.id === mediaId);
    if (!target) return;

    const newPublished = !target.isPublished;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').update({ is_published: newPublished }).eq('id', mediaId);
    }

    setMedia(prev => {
      const updated = prev.map(m => (m.id === mediaId ? { ...m, isPublished: newPublished } : m));
      try {
        localStorage.setItem('bbh_portfolio_media', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const openBooking = (serviceId = null, specificStyle = null) => {
    let targetService = services.find(s => s.isActive !== false) || services[0] || SERVICES[0];
    if (serviceId) {
      const found = services.find(s => s.id === serviceId || s.dbId === serviceId || s.slug === serviceId);
      if (found) targetService = found;
    }

    const availableStyles = Array.isArray(targetService.styles) ? targetService.styles : [];
    let chosenStyle = specificStyle;
    if (!chosenStyle || !availableStyles.includes(chosenStyle)) {
      chosenStyle = availableStyles[0] || '';
    }

    setBookingData(prev => ({
      ...prev,
      service: targetService,
      styleChoice: chosenStyle,
    }));
    setBookingStep(1);
    setSubmissionError(null);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSubmissionError(null);
  };

  const updateBookingData = (fields) => {
    setBookingData(prev => ({ ...prev, ...fields }));
  };

  // Submit client booking request (AC 1)
  const submitBooking = async () => {
    setSubmissionLoading(true);
    setSubmissionError(null);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `BBH-${randomSuffix}`;
    const cleanPhone = sanitizeNigerianPhone(bookingData.phone);

    // Verify if serviceDbId is a valid UUID for PostgreSQL column type
    const isUuid = (val) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const dbServiceId = isUuid(bookingData.service?.dbId) ? bookingData.service.dbId : null;

    const newAppointment = {
      id: bookingReference,
      bookingReference,
      customerName: bookingData.fullName.trim() || 'Client',
      phone: bookingData.phone.trim() || '09010189746',
      whatsappClean: cleanPhone,
      serviceId: bookingData.service?.id || 'custom',
      serviceDbId: dbServiceId,
      serviceName: bookingData.service?.name || 'Hair Styling',
      styleChoice: bookingData.styleChoice || 'Selected variation',
      date: bookingData.formattedDate,
      dateIso: bookingData.date,
      time: bookingData.time,
      timePeriod: bookingData.timePeriod,
      status: 'pending',
      dbStatus: 'PENDING',
      note: bookingData.note.trim() || 'None provided',
      createdAt: 'Just now',
      source: 'Online Booking',
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('bookings')
          .insert([
            {
              booking_reference: bookingReference,
              customer_name: newAppointment.customerName,
              customer_phone: newAppointment.phone,
              customer_phone_clean: cleanPhone,
              service_id: dbServiceId,
              service_name: newAppointment.serviceName,
              style_choice: newAppointment.styleChoice,
              booking_date: newAppointment.dateIso,
              time_slot: newAppointment.time,
              time_period: newAppointment.timePeriod,
              customer_note: newAppointment.note,
              status: 'PENDING',
            },
          ]);

        if (error) {
          console.error('Supabase booking insert error:', error.message);
        }
      }

      updateAndPersistAppointments(prev => [
        newAppointment,
        ...prev.filter(a => a.bookingReference !== bookingReference),
      ]);
      setConfirmedBooking(newAppointment);
      setBookingStep(5);

      // Trigger Web Push notification alert to Helen (Slice 4)
      try {
        notifyBookingCreated(newAppointment);
      } catch (pushErr) {
        console.warn('Push dispatch warning:', pushErr);
      }

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#70263D', '#C5A46D', '#D9A6A6', '#302522'],
        });
      } catch (e) {
        // Confetti fallback
      }

      return newAppointment;
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmissionError(err.message || 'Booking submission failed. Please try again.');
      throw err;
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Confirm appointment with atomic conflict prevention (AC 2, AC 7)
  const confirmAppointment = async (appointmentId) => {
    const target = appointments.find(a => a.id === appointmentId || a.bookingReference === appointmentId);
    if (!target) {
      throw new Error('Appointment not found');
    }

    // 1. Inspect local availability and conflict state
    const conflict = getAppointmentConflict(target);
    if (conflict) {
      throw new Error(conflict.message);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Attempt atomic database RPC check
        const { data, error } = await supabase.rpc('confirm_booking', {
          p_booking_id: target.id,
        });

        if (error) {
          // If RPC returns conflict error, throw immediately
          if (
            error.message &&
            (error.message.includes('Double booking conflict') ||
              error.message.includes('Date conflict') ||
              error.message.includes('Time slot conflict') ||
              error.message.includes('conflict'))
          ) {
            throw new Error(error.message);
          }
          // If RPC is unavailable or fails for another reason, fallback to direct table update
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'CONFIRMED',
              confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', target.id);

          if (updateError) throw updateError;
        }
      } catch (err) {
        throw err;
      }
    }

    // Update in local state
    updateAndPersistAppointments(prev =>
      prev.map(app =>
        app.id === target.id
          ? { ...app, status: 'confirmed', dbStatus: 'CONFIRMED', confirmedAt: new Date().toISOString() }
          : app
      )
    );

    // Refresh public schedule so the slot is booked live
    await fetchPublicSchedule();

    return target;
  };

  // Propose reschedule with alternative date and slot (AC 5)
  const rescheduleAppointment = async (appointmentId, { proposedDate, proposedTimeSlot, note }) => {
    const target = appointments.find(a => a.id === appointmentId || a.bookingReference === appointmentId);
    if (!target) {
      throw new Error('Appointment not found');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'RESCHEDULE_PROPOSED',
          proposed_date: proposedDate,
          proposed_time_slot: proposedTimeSlot,
          updated_at: new Date().toISOString(),
        })
        .eq('id', target.id);

      if (error) throw error;
    }

    updateAndPersistAppointments(prev =>
      prev.map(app =>
        app.id === target.id
          ? {
              ...app,
              status: 'reschedule_proposed',
              dbStatus: 'RESCHEDULE_PROPOSED',
              proposedDate,
              proposedTimeSlot,
              rescheduleNote: note,
            }
          : app
      )
    );

    return target;
  };

  // Decline appointment with mandatory reason (AC 6)
  const declineAppointment = async (appointmentId, { reason, customNote }) => {
    const target = appointments.find(a => a.id === appointmentId || a.bookingReference === appointmentId);
    if (!target) {
      throw new Error('Appointment not found');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'REJECTED',
          rejection_reason: reason,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', target.id);

      if (error) throw error;
    }

    updateAndPersistAppointments(prev =>
      prev.map(app =>
        app.id === target.id
          ? {
              ...app,
              status: 'rejected',
              dbStatus: 'REJECTED',
              rejectionReason: reason,
              declineNote: customNote,
            }
          : app
      )
    );

    return target;
  };

  // Mark appointment completed
  const completeAppointment = async (appointmentId) => {
    const target = appointments.find(a => a.id === appointmentId || a.bookingReference === appointmentId);
    if (!target) return;

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('bookings')
        .update({
          status: 'COMPLETED',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', target.id);
    }

    updateAndPersistAppointments(prev =>
      prev.map(app =>
        app.id === target.id
          ? { ...app, status: 'completed', dbStatus: 'COMPLETED' }
          : app
      )
    );
  };

  // Delete or archive appointment
  const deleteAppointment = async (appointmentId) => {
    const target = appointments.find(a => a.id === appointmentId || a.bookingReference === appointmentId);
    if (!target) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .delete()
          .eq('id', target.id);
      } catch (err) {
        console.warn('Could not delete booking from Supabase:', err.message);
      }
    }

    updateAndPersistAppointments(prev =>
      prev.filter(app => app.id !== target.id && app.bookingReference !== (target.bookingReference || target.id))
    );
  };

  const updateAppointmentStatus = (id, newStatus) => {
    updateAndPersistAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const value = {
    currentView,
    setCurrentView,
    selectedCategory,
    setSelectedCategory,
    services,
    servicesLoading,
    isBookingOpen,
    openBooking,
    closeBooking,
    bookingStep,
    setBookingStep,
    bookingData,
    updateBookingData,
    submitBooking,
    submissionLoading,
    submissionError,
    confirmedBooking,
    appointments,
    appointmentsLoading,
    appointmentsError,
    fetchAppointments,
    confirmAppointment,
    rescheduleAppointment,
    declineAppointment,
    completeAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    isLiveBackend: isSupabaseConfigured,
    // Availability & Schedule Controls (Slice 2)
    publicSchedule,
    scheduleLoading,
    fetchPublicSchedule,
    adminAvailability,
    availabilityLoading,
    fetchAdminAvailability,
    blockDate,
    unblockDate,
    blockSlot,
    unblockSlot,
    getAppointmentConflict,
    // Services & Portfolio Media (Slice 3)
    fetchServices,
    saveService,
    createService,
    toggleServiceActive,
    media,
    mediaLoading,
    fetchMedia,
    uploadMediaFile,
    saveMediaItem,
    deleteMediaItem,
    toggleMediaPublished,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
