import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  Send,
  Download,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  isPushSupported,
  isStandalone,
  isIOS,
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPushNotification,
  getNotificationPermission
} from '../../services/pushNotificationService';

export default function PushNotificationSettingsModal({ isOpen, onClose, onOpenInstallGuide }) {
  const [supported, setSupported] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceName, setDeviceName] = useState("Helen's Mobile Device");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      const isSupp = isPushSupported();
      setSupported(isSupp);
      setStandalone(isStandalone());
      setIosDevice(isIOS());
      setPermission(getNotificationPermission());

      if (isSupp) {
        const sub = await getCurrentPushSubscription();
        setIsSubscribed(Boolean(sub));
      }
    };

    checkStatus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    setLoading(true);
    setErrorMessage(null);
    setTestStatus(null);

    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
      } else {
        await subscribeToPush(deviceName);
        setIsSubscribed(true);
        setPermission('granted');
      }
    } catch (err) {
      console.error('Push toggle error:', err);
      setErrorMessage(err.message || 'Failed to update push subscription.');
      setPermission(getNotificationPermission());
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    setTestStatus(null);
    try {
      const sent = await sendTestPushNotification();
      if (sent) {
        setTestStatus('Test notification sent to this device.');
      } else {
        setTestStatus('Could not display notification. Check browser permissions.');
      }
    } catch (err) {
      setTestStatus('Error sending test notification.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="w-full max-w-lg bg-[#FFF9F2] rounded-3xl border border-stone-300/80 shadow-2xl p-6 sm:p-7 relative overflow-hidden text-left my-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="push-settings-title"
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rosewood/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-espresso/40 hover:text-espresso rounded-full hover:bg-espresso/5 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-rosewood/10 text-rosewood flex items-center justify-center shadow-sm flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rosewood">
                Salon Alerts
              </span>
              <h2 id="push-settings-title" className="text-xl font-serif font-bold text-espresso">
                Web Push Notifications
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-espresso/80 leading-relaxed mb-6">
            Receive background alerts on your mobile phone or desktop the instant a customer requests an appointment.
          </p>

          {/* Subscription Status Card */}
          <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-blush/25 mb-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                <span className="text-sm font-semibold text-espresso">
                  {isSubscribed ? 'Notifications Active' : 'Notifications Inactive'}
                </span>
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isSubscribed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                }`}>
                {isSubscribed ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Device Nickname Input */}
            <div>
              <label className="block text-xs font-semibold text-espresso/70 mb-1.5">
                Device Label
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={isSubscribed}
                placeholder="e.g. Helen's iPhone 14"
                className="w-full text-xs sm:text-sm bg-cream/50 border border-blush/30 rounded-xl px-3.5 py-2.5 text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-rosewood/30 disabled:opacity-60"
              />
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleTogglePush}
              disabled={loading || !supported}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] ${isSubscribed
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-rosewood hover:bg-rosewood/90 text-espresso/70'
                }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <BellOff className="w-4 h-4" />
                  <span>Disable Push on This Device</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Enable Push Notifications</span>
                </>
              )}
            </button>
          </div>

          {/* Special Warnings for iOS or Blocked Permissions */}
          {permission === 'denied' && (
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Notifications Blocked in Browser</strong>
                <span>You previously denied notification access. To receive booking alerts, open your browser settings and allow notifications for this site.</span>
              </div>
            </div>
          )}

          {iosDevice && !standalone && (
            <div className="bg-rosewood/5 rounded-2xl p-3.5 border border-rosewood/15 text-espresso text-xs flex items-start gap-2.5 mb-5">
              <Smartphone className="w-4 h-4 text-rosewood flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <strong className="font-semibold block text-rosewood">iPhone Standalone Requirement</strong>
                <p className="text-espresso/80">
                  Apple requires the app to be added to your Home Screen before Web Push notifications can run.
                </p>
                {onOpenInstallGuide && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallGuide();
                    }}
                    className="text-xs font-semibold text-rosewood hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>View Add to Home Screen Guide</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {testStatus && (
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 mb-5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{testStatus}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-blush/20">
            {isSubscribed ? (
              <button
                onClick={handleSendTest}
                disabled={loading}
                className="text-xs font-semibold text-rosewood hover:text-rosewood/80 inline-flex items-center gap-1.5 py-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Alert</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-espresso/50">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>VAPID 256-bit Encrypted</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-xs font-medium text-espresso/70 hover:text-espresso py-1.5 px-3 rounded-lg hover:bg-espresso/5 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
