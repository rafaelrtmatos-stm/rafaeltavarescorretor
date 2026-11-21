import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BenefitsBar } from './components/BenefitsBar';
import { ExploreOpportunities } from './components/ExploreOpportunities';
import { PropertyCarousel } from './components/PropertyCarousel';
import { FamilyBanner } from './components/FamilyBanner';
import { BenefitsCards } from './components/BenefitsCards';
import { MainCtaButton } from './components/MainCtaButton';
import { Footer } from './components/Footer';
import { PropertyModal } from './components/PropertyModal';
import { MobileMenu } from './components/MobileMenu';
import { PROPERTIES, Property } from './data/properties';

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleWhatsAppClick = (customText?: string) => {
    const text = customText 
      ? `Olá Rafael, tenho interesse no terreno *${customText}* da Black Friday dos Terrenos 2026!`
      : `Olá Rafael, quero escolher meu terreno na Black Friday dos Terrenos 2026!`;
    const url = `https://wa.me/5593992332012?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#032215] text-white flex flex-col w-full overflow-x-hidden selection:bg-[#d4af37] selection:text-[#032215]">
      
      {/* 1. Cabeçalho verde-escuro */}
      <Header 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onWhatsAppClick={() => handleWhatsAppClick()}
      />

      <main className="flex-grow w-full">
        {/* 2. Hero Black Friday with user-supplied banner */}
        <HeroSection 
          onCtaClick={() => {
            const exploreEl = document.getElementById('explore');
            if (exploreEl) {
              exploreEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* 3. Faixa horizontal com quatro benefícios */}
        <BenefitsBar />

        <div id="explore" className="w-full">
          {/* 4. Seção branca Explore as Oportunidades */}
          <ExploreOpportunities />

          {/* 5. Carrossel horizontal com terrenos */}
          <PropertyCarousel 
            properties={PROPERTIES}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        </div>

        <div id="patrimonio" className="w-full">
          {/* 6. Banner panorâmico da família */}
          <FamilyBanner />
        </div>

        {/* 7. Quatro cards de benefícios */}
        <BenefitsCards />

        {/* 8. Botão Quero Escolher Meu Terreno */}
        <MainCtaButton 
          onClick={() => handleWhatsAppClick()}
        />
      </main>

      {/* 9. Rodapé verde-escuro */}
      <Footer 
        onWhatsAppClick={() => handleWhatsAppClick()}
      />

      {/* Property Details Modal */}
      <PropertyModal 
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onWhatsAppInquiry={(title) => {
          setSelectedProperty(null);
          handleWhatsAppClick(title);
        }}
      />

      {/* Mobile Navigation Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onWhatsAppClick={() => handleWhatsAppClick()}
      />

    </div>
  );
}
