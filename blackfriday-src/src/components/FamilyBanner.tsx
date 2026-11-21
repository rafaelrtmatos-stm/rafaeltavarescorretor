import React from 'react';

export const FamilyBanner: React.FC = () => {
  return (
    <section className="relative w-full bg-[#032215] overflow-hidden">
      {/* Family Banner Image supplied by user */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] overflow-hidden shadow-xl bg-[#032215]">
        <img
          src="/blackfriday/assets/aistudio/banner_familia__1__3a00f71a.png"
          alt="Mais do que um terreno. O começo de uma nova história."
          className="w-full h-full object-contain sm:object-cover object-center"
        />
      </div>
    </section>
  );
};
