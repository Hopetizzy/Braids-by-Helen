import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/customer/Hero';
import { ServiceList } from './components/customer/ServiceList';
import { WhyBookSection } from './components/customer/WhyBookSection';
import { GallerySection } from './components/customer/GallerySection';
import { LynaDashboard } from './components/business/LynaDashboard';
import { AdminLogin } from './components/auth/AdminLogin';
import { Footer } from './components/layout/Footer';
import { BookingModal } from './components/booking/BookingModal';
import InstallPromptModal from './components/pwa/InstallPromptModal';

const AppContent = () => {
  const { currentView, setCurrentView } = useBooking();
  const { isAdmin } = useAuth();

  // Listen for push notification deep links or URL query parameters
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const hasAdminQuery = params.has('admin') || params.get('admin') === 'true';
    const hasAdminHash = window.location.hash === '#admin';
    if (viewParam === 'admin' || viewParam === 'business' || hasAdminQuery || hasAdminHash) {
      setCurrentView('business');
    }

    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_DEEP_LINK') {
        setCurrentView('business');
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-espresso antialiased font-sans selection:bg-primary-100 selection:text-primary-900">
      
      <Navbar />

      <main className="flex-1">
        {currentView === 'customer' ? (
          <>
            <Hero />
            <ServiceList />
            <GallerySection />
            <WhyBookSection />
          </>
        ) : (
          isAdmin ? <LynaDashboard /> : <AdminLogin />
        )}
      </main>

      <Footer />

      {/* 5-Step Guided Booking Modal */}
      <BookingModal />

      {/* PWA Home Screen Installation Prompt (Slice 4) */}
      <InstallPromptModal />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
