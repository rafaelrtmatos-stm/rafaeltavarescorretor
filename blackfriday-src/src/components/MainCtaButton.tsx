import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface MainCtaButtonProps {
  onClick: () => void;
}

export const MainCtaButton: React.FC<MainCtaButtonProps> = ({ onClick }) => {
  return (
    <section className="bg-gradient-to-b from-[#031c11] to-[#02150d] pt-0 pb-[50px] px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onClick}
          className="cristal cristal-verde group relative w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 sm:px-12 py-5 text-white font-black text-lg sm:text-xl rounded-2xl transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <span className="tracking-wider uppercase">QUERO ESCOLHER MEU TERRENO</span>
          <ArrowRight className="w-6 h-6 text-[#facc15] transition-transform group-hover:translate-x-2 flex-shrink-0" />
        </button>
      </div>
    </section>
  );
};
