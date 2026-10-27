import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { DevelopmentDetail } from './components/DevelopmentDetail';
import { RentalsCatalog } from './components/RentalsCatalog';
import { ReservaFlow } from './components/ReservaFlow';
import { AdminDashboard } from './components/AdminDashboard';
import { developments } from './data/developmentsData';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home'); // home | detail | rentals | reserva | admin
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  const handleSelectDevelopment = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReserva = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView('reserva');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDev = developments.find(d => d.slug === selectedSlug);

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4] font-sans flex flex-col selection:bg-[#C9A84C] selection:text-black">
      <Navbar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Home 
            onSelectDevelopment={handleSelectDevelopment}
            onOpenRentals={() => { setCurrentView('rentals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {currentView === 'detail' && currentDev && (
          <DevelopmentDetail 
            development={currentDev}
            onBack={() => setCurrentView('home')}
            onStartReserva={handleStartReserva}
          />
        )}

        {currentView === 'rentals' && (
          <RentalsCatalog />
        )}

        {currentView === 'reserva' && currentDev && (
          <ReservaFlow 
            development={currentDev}
            onBack={() => setCurrentView('detail')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
