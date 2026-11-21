import React from 'react';

export const FamilyBanner: React.FC = () => {
  return (
    <section className="relative w-full bg-gradient-to-b from-white from-10% to-[#031c11] to-60% overflow-hidden -mb-px">
      {/* Family Banner Image supplied by user (transparent PNG) */}
      <div className="relative w-full overflow-hidden bg-transparent">
        <img
          src="/blackfriday/assets/aistudio/02_9b5f7957.png"
          alt="Mais do que um terreno. O começo de uma nova história."
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
};
