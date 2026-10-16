import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { isStandalone, isIOS } from '../../services/pushNotificationService';

const DISMISS_KEY = 'braids_by_helen_install_dismissed';

export default function InstallPromptModal({ forceOpen = false, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceIsIOS, setDeviceIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running standalone
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    setDeviceIsIOS(isIOS());

    // Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not dismissed, show guide after short delay
    if (isIOS()) {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen || isInstalled) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="flex min-h-full items-end sm:items-center justify-center p-4 text-center">
        <div 
          className="w-full max-w-md bg-[#FFF9F2] rounded-3xl border border-stone-300/80 shadow-2xl p-6 sm:p-7 relative overflow-hidden animate-slide-up text-left my-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
        >
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rosewood/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-rosewood/10 border border-rosewood/20 flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0">
            <img 
              src="/assets/icon.png" 
              alt="Braids by Helen App Icon" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rosewood-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mobile Experience</span>
            </div>
            <h3 id="install-modal-title" className="text-xl font-serif font-bold text-stone-900">
              Install Braids by Helen
            </h3>
          </div>
        </div>

        <p className="text-sm font-medium text-stone-700 leading-relaxed mb-6">
          Add the salon to your phone home screen for instant booking access, offline gallery previews, and direct appointment notifications.
        </p>

        {/* Device Specific Content */}
        {deviceIsIOS ? (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rosewood-700" />
              <span>How to install on iPhone & iPad</span>
            </div>
            
            <ol className="text-xs text-stone-700 space-y-2.5 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rosewood/10 text-rosewood-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong className="text-stone-900 font-bold">Share</strong> button at the bottom of Safari (<Share className="w-3.5 h-3.5 inline text-rosewood-700 mx-0.5 -mt-0.5" /> icon).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rosewood/10 text-rosewood-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down the options and select <strong className="text-stone-900 font-bold">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-rosewood-700 mx-0.5 -mt-0.5" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rosewood/10 text-rosewood-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong className="text-stone-900 font-bold">Add</strong> in the top right corner to finish.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="mb-6">
            <ul className="text-xs text-stone-800 space-y-2.5 mb-4 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rosewood-700 flex-shrink-0" />
                <span>One-tap access directly from your app drawer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rosewood-700 flex-shrink-0" />
                <span>Instant appointment alerts and status updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rosewood-700 flex-shrink-0" />
                <span>Works smoothly even on slow mobile networks</span>
              </li>
            </ul>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-rosewood-700 text-white rounded-2xl font-bold text-sm hover:bg-rosewood-800 shadow-md transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Install Application</span>
              </button>
            )}
          </div>
        )}

        {/* Secondary Action */}
        <div className="flex justify-between items-center pt-3 border-t border-stone-200">
          <button
            onClick={handleDismiss}
            className="text-xs text-stone-600 hover:text-stone-900 font-semibold py-1.5 transition-colors"
          >
            Maybe later
          </button>
          
          <span className="text-[11px] text-stone-500 font-medium">
            Version 1.0 · PWA Enabled
          </span>
        </div>
      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
}
