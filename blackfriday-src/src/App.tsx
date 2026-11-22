import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ExploreOpportunities } from './components/ExploreOpportunities';
import { PropertyCarousel } from './components/PropertyCarousel';
import { FamilyBanner } from './components/FamilyBanner';
import { BenefitsCards } from './components/BenefitsCards';
import { Footer } from './components/Footer';
import { PropertyPage } from './components/PropertyPage';
import { Countdown } from './components/Countdown';
import { MobileMenu } from './components/MobileMenu';
import { MessageCircle } from 'lucide-react';
import { PROPERTIES, Property, findPropertyByPath } from './data/properties';

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(() => {
    return findPropertyByPath(window.location.pathname);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const initialIdx = selectedProperty
    ? Math.max(0, PROPERTIES.findIndex((p) => p.id === selectedProperty.id))
    : 1;

  const savedScroll = useRef(0);
  const [simOpen, setSimOpen] = useState(false);

  const openProperty = useCallback((prop: Property) => {
    savedScroll.current = window.scrollY;
    setSelectedProperty(prop);
    if (window.location.pathname !== prop.catalogUrl) {
      window.history.pushState({ propertySlug: prop.slug }, '', prop.catalogUrl);
    }
  }, []);

  const closeProperty = useCallback(() => {
    setSelectedProperty(null);
    if (window.location.pathname !== '/blackfriday/') {
      window.history.pushState({}, '', '/blackfriday/');
    }
    window.setTimeout(() => {
      const el = document.getElementById('explore');
      window.scrollTo(0, savedScroll.current || (el ? el.offsetTop : 0));
    }, 0);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedProperty(findPropertyByPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleWhatsAppClick = (customText?: string) => {
    const text = customText 
      ? `Olá Rafael, tenho interesse no terreno *${customText}* da Black Friday dos Terrenos 2026!`
      : `Olá Rafael, quero escolher meu terreno na Black Friday dos Terrenos 2026!`;
    const url = `https://wa.me/5593992332012?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-white flex flex-col w-full overflow-x-hidden selection:bg-[#d4af37] selection:text-[#032215]">
      
      {/* 1. Cabeçalho verde-escuro */}
      <div className="sticky top-0 z-50">
        {!simOpen && <Countdown />}
        <Header 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onWhatsAppClick={() => handleWhatsAppClick()}
        />
      </div>

      {selectedProperty && (
        <PropertyPage
          property={selectedProperty}
          onBack={closeProperty}
          onSimulatorChange={setSimOpen}
          onWhatsAppInquiry={(title) => handleWhatsAppClick(title)}
        />
      )}

      <main className={`flex-grow w-full bg-white ${selectedProperty ? 'hidden' : ''}`}>
        {/* 2. Hero Black Friday with user-supplied banner */}
        <HeroSection 
          onCtaClick={() => {
            const exploreEl = document.getElementById('explore');
            if (exploreEl) {
              exploreEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        <div id="explore" className="w-full">
          {/* 3. Seção branca Explore as Oportunidades */}
          <ExploreOpportunities />

          {/* 5. Carrossel horizontal com terrenos */}
          <PropertyCarousel 
            properties={PROPERTIES}
            initialIndex={initialIdx}
            onSelectProperty={openProperty}
          />
        </div>

        <div id="patrimonio" className="w-full">
          {/* 6. Banner panorâmico da família */}
          <FamilyBanner />
        </div>

        {/* 7. Quatro cards de benefícios */}
        <BenefitsCards />
      </main>

      {/* 9. Rodapé verde-escuro */}
      <Footer 
        onWhatsAppClick={() => handleWhatsAppClick()}
      />

      {/* Botão fixo de WhatsApp */}
      <button
        type="button"
        onClick={() => handleWhatsAppClick(selectedProperty?.title)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-gradient-to-r from-[#25d366] to-[#20ba59] text-white font-black text-sm pl-4 pr-5 py-3 rounded-full shadow-[0_6px_24px_rgba(37,211,102,0.55)] cursor-pointer"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span>WhatsApp</span>
      </button>

      {/* Mobile Navigation Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onWhatsAppClick={() => handleWhatsAppClick()}
      />

    </div>
  );
}
