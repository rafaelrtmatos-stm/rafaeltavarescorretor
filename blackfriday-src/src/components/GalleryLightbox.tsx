import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { GalleryItem } from '../data/properties';

interface GalleryLightboxProps {
  items: GalleryItem[];
  startIndex: number;
  title: string;
  onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ items, startIndex, title, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const many = items.length > 1;
  const current = items[index];

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const goTo = (next: number) => setIndex((next + items.length) % items.length);

  // Vídeo na tela cheia toca COM som (a pessoa acabou de tocar para abrir).
  // Se o navegador bloquear, cai para mudo e os controles deixam ativar o som.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || current.type !== 'video') return;
    v.muted = false;
    v.volume = 1;
    const playing = v.play();
    if (playing) {
      playing.catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  }, [current.src, current.type]);

  useEffect(() => {
    // Captura antes do modal do terreno: Esc fecha só a galeria.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'ArrowRight' && items.length > 1) {
        e.stopImmediatePropagation();
        setIndex((i) => (i + 1) % items.length);
      } else if (e.key === 'ArrowLeft' && items.length > 1) {
        e.stopImmediatePropagation();
        setIndex((i) => (i - 1 + items.length) % items.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [items.length, onClose]);

  useEffect(() => {
    const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !many) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) goTo(index + (delta < 0 ? 1 : -1));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] bg-black flex flex-col select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de ${title}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm truncate">{title}</div>
          {many && (
            <div className="text-[#facc15] text-xs font-semibold">
              {index + 1} / {items.length}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/25 transition-colors cursor-pointer flex-shrink-0"
          aria-label="Fechar galeria"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Foto / vídeo em tela cheia */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {current.type === 'video' ? (
          <video
            key={current.src}
            ref={videoRef}
            src={current.src}
            poster={current.poster}
            className="max-w-full max-h-full w-auto h-auto"
            controls
            playsInline
          />
        ) : (
          <img
            key={current.src}
            src={current.src}
            alt={`${title} - foto ${index + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            draggable={false}
          />
        )}

        {many && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center border border-white/25 transition-colors cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center border border-white/25 transition-colors cursor-pointer"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {many && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto px-4 py-3 flex-shrink-0 justify-start sm:justify-center"
        >
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                i === index ? 'border-[#facc15] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver ${item.type === 'video' ? 'vídeo' : 'foto'} ${i + 1}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-slate-800"
                style={{ backgroundImage: `url('${item.type === 'video' ? item.poster ?? '' : item.src}')` }}
              ></div>
              {item.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Play className="w-5 h-5 text-white fill-current" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};
