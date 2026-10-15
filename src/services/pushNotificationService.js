import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Standard demo VAPID public key (65 bytes uncompressed P-256 point)
// Used when VITE_VAPID_PUBLIC_KEY is not defined in environment
const DEFAULT_VAPID_PUBLIC_KEY = 
  import.meta.env.VITE_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBKr3qBUYhHBQFLXYp5Nksh8U';

const LOCAL_SUBSCRIPTION_KEY = 'braids_by_helen_push_sub';

/**
 * Convert URL safe base64 to Uint8Array for applicationServerKey
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the browser supports Service Worker, Push Manager, and Notifications
 */
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check if the application is running in standalone PWA mode
 */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Check if the current device is running iOS
 */
export function isIOS() {
  if (typeof window === 'undefined') return false;
  return (
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream
  );
}

/**
 * Register the Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    return registration;
  } catch (error) {
    console.error('[Push Service] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Get active service worker registration
 */
export async function getSWRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  return await navigator.serviceWorker.ready;
}

/**
 * Get current push subscription if one exists
 */
export async function getCurrentPushSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await getSWRegistration();
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('[Push Service] Error retrieving current subscription:', err);
    return null;
  }
}

/**
 * Check push permission status ('granted', 'denied', 'default', or 'unsupported')
 */
export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Subscribe device to Web Push notifications
 */
export async function subscribeToPush(deviceName = "Helen's Mobile Device") {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser environment.');
  }

  // Request browser permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(`Notification permission was ${permission}. Please enable notifications in your browser settings.`);
  }

  const registration = await getSWRegistration();
  if (!registration) {
    throw new Error('Service worker is not active. Please refresh the page and try again.');
  }

  // Retrieve or create push subscription
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const convertedKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
  }

  const rawKey = subscription.getKey ? subscription.getKey('p256dh') : null;
  const rawAuth = subscription.getKey ? subscription.getKey('auth') : null;

  const p256dh = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
  const auth = rawAuth ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuth))) : '';

  const subscriptionPayload = {
    endpoint: subscription.endpoint,
    p256dh,
    auth,
    device_name: deviceName,
    user_agent: navigator.userAgent,
    is_active: true,
    last_notified_at: null
  };

  // Persist to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionPayload, { onConflict: 'endpoint' });

      if (error) {
        console.warn('[Push Service] Supabase subscription persistence note:', error.message);
      }
    } catch (dbErr) {
      console.warn('[Push Service] Failed to store in database:', dbErr);
    }
  }

  // Cache in localStorage for offline demo reliability
  localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify({
    ...subscriptionPayload,
    subscribedAt: new Date().toISOString()
  }));

  return subscription;
}

/**
 * Unsubscribe device from push notifications
 */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return false;
  try {
    const registration = await getSWRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', subscription.endpoint);
      }
    }
    localStorage.removeItem(LOCAL_SUBSCRIPTION_KEY);
    return true;
  } catch (err) {
    console.error('[Push Service] Unsubscribe failed:', err);
    return false;
  }
}

/**
 * Dispatch booking push notification to Helen's registered devices
 */
export async function notifyBookingCreated(booking) {
  const title = 'Braids by Helen — New Booking Request!';
  const body = `${booking.customer_name || 'Client'} booked ${booking.service_name || 'Hairstyle'} for ${booking.appointment_date || 'Upcoming date'} at ${booking.appointment_time || 'scheduled time'}.`;

  // 1. Log to database if connected
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('notification_logs').insert({
        booking_id: booking.id || null,
        event_type: 'booking_created',
        title,
        body,
        status: 'sent'
      });
    } catch (logErr) {
      console.warn('[Push Service] Could not log notification:', logErr);
    }
  }

  // 2. Trigger local service worker alert if browser permission is active
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const registration = await getSWRegistration();
      if (registration) {
        registration.showNotification(title, {
          body,
          icon: '/assets/icon-192.png',
          badge: '/assets/icon-192.png',
          vibrate: [200, 100, 200],
          data: {
            url: `/?view=admin&bookingId=${booking.id || ''}`,
            bookingId: booking.id || null
          }
        });
      }
    } catch (swErr) {
      console.warn('[Push Service] Local SW notification trigger notice:', swErr);
    }
  }
}

/**
 * Dispatch test notification
 */
export async function sendTestPushNotification() {
  const title = 'Braids by Helen — Push Test';
  const body = 'Push notifications are working smoothly on your device!';

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const registration = await getSWRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
          url: '/?view=admin',
          test: true
        }
      });
      return true;
    }
  }
  return false;
}
