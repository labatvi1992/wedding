import React, { useEffect, useRef, useState, useCallback } from 'react';
import Glide from '@glidejs/glide';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { WEDDING_GALLERY_IMAGES } from '../data/initialData';

export const PhotoGallerySection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const glideInstanceRef = useRef<Glide | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [activeCenterIdx, setActiveCenterIdx] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Calculate and apply smooth 3D Coverflow transform to all slides
  const update3DEffect = useCallback(() => {
    if (!sliderRef.current) return;
    const track = sliderRef.current.querySelector<HTMLElement>('[data-glide-el="track"]');
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenterX = trackRect.left + trackRect.width / 2;

    const slides = sliderRef.current.querySelectorAll<HTMLElement>('.glide__slide');
    if (!slides.length) return;

    let closestIdx = 0;
    let minDistance = Infinity;

    slides.forEach((slide) => {
      const card = slide.querySelector<HTMLElement>('.glide-3d-card-wrapper');
      if (!card) return;

      const slideRect = slide.getBoundingClientRect();
      const slideCenterX = slideRect.left + slideRect.width / 2;
      const slideWidth = slideRect.width || 1;

      const rawDistance = (slideCenterX - trackCenterX) / slideWidth;
      const distance = Math.max(-2.5, Math.min(2.5, rawDistance));
      const absDist = Math.abs(distance);

      if (absDist < minDistance) {
        minDistance = absDist;
        const rawDataIdx = slide.getAttribute('data-gallery-idx');
        if (rawDataIdx !== null) {
          closestIdx = parseInt(rawDataIdx, 10);
        }
      }

      if (absDist < 0.32) {
        // Active center card: crisp forward pop, 0deg rotation
        card.style.transform =
          'perspective(1100px) rotateY(0deg) scale(1) translateZ(30px)';
        card.style.opacity = '1';
        card.style.filter = 'brightness(1.02) contrast(1.02)';
        card.style.zIndex = '30';
        card.classList.add('is-active-3d');
      } else {
        // Side cards angled in 3D perspective toward the center
        const isLeft = distance < 0;
        const angle = isLeft
          ? Math.min(34, Math.max(18, absDist * 28))
          : -Math.min(34, Math.max(18, absDist * 28));

        const scale = Math.max(0.78, 1 - absDist * 0.16);
        const translateZ = -Math.min(110, absDist * 55);
        const opacity = Math.max(0.48, 1 - absDist * 0.35);
        const brightness = Math.max(0.72, 1 - absDist * 0.22);

        card.style.transform = `perspective(1100px) rotateY(${angle.toFixed(1)}deg) scale(${scale.toFixed(2)}) translateZ(${translateZ.toFixed(0)}px)`;
        card.style.opacity = opacity.toFixed(2);
        card.style.filter = `brightness(${brightness.toFixed(2)})`;
        card.style.zIndex = `${Math.max(1, 20 - Math.round(absDist * 6))}`;
        card.classList.remove('is-active-3d');
      }
    });

    if (minDistance < 0.5) {
      setActiveCenterIdx(closestIdx);
    }
  }, []);

  // Continuous smooth 3D frame updates during slide transitions & dragging
  const triggerTransitionFrames = useCallback(() => {
    update3DEffect();
    let frames = 0;
    const loop = () => {
      update3DEffect();
      frames++;
      if (frames < 42) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(loop);
  }, [update3DEffect]);

  useEffect(() => {
    if (!sliderRef.current) return;

    const glide = new Glide(sliderRef.current, {
      type: 'carousel',
      startAt: 0,
      focusAt: 'center',
      perView: 1,
      peek: { before: 78, after: 78 },
      gap: 14,
      autoplay: 3500,
      hoverpause: true,
      animationDuration: 650,
      animationTimingFunc: 'cubic-bezier(0.25, 1, 0.5, 1)',
      touchRatio: 0.65,
      breakpoints: {
        420: {
          perView: 1,
          peek: { before: 64, after: 64 },
          gap: 12,
          focusAt: 'center',
        },
      },
    });

    glide.on(['mount.after', 'build.after'], () => {
      if (sliderRef.current) {
        const slides = sliderRef.current.querySelectorAll<HTMLElement>('.glide__slide');
        slides.forEach((slide, sIdx) => {
          const realIdx = sIdx % WEDDING_GALLERY_IMAGES.length;
          slide.setAttribute('data-gallery-idx', realIdx.toString());
        });
      }
      setTimeout(update3DEffect, 40);
    });

    glide.on(['run', 'run.after', 'swipe.move', 'move'], () => {
      triggerTransitionFrames();
    });

    glide.on(['move.after', 'resize'], () => {
      update3DEffect();
    });

    glide.mount();
    glideInstanceRef.current = glide;

    window.addEventListener('resize', update3DEffect);

    return () => {
      window.removeEventListener('resize', update3DEffect);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      try {
        glide.destroy();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [triggerTransitionFrames, update3DEffect]);

  const handleSlideClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === activeCenterIdx) {
      setSelectedIdx(idx);
    } else if (glideInstanceRef.current) {
      glideInstanceRef.current.go(`=${idx}`);
    }
  };

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx(
        (selectedIdx - 1 + WEDDING_GALLERY_IMAGES.length) % WEDDING_GALLERY_IMAGES.length
      );
    }
  };

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % WEDDING_GALLERY_IMAGES.length);
    }
  };

  return (
    <div className="w-full pt-4 pb-6 bg-white relative overflow-hidden select-none">
      {/* Section Heading */}
      <div className="text-center mb-3 px-4">
        <h3 className="font-calligraphy text-[36px] sm:text-[42px] text-[#721319] leading-tight">
          Khoảnh khắc hạnh phúc
        </h3>
        <p className="font-serif-editorial italic text-xs sm:text-sm text-stone-500">
          Vuốt ngang để xem album ảnh 3D
        </p>
      </div>

      {/* 3D Coverflow Stage */}
      <div className="relative w-full glide-3d-stage">
        <div ref={sliderRef} className="glide">
          <div
            className="glide__track py-5 overflow-visible"
            data-glide-el="track"
          >
            <ul className="glide__slides flex items-center">
              {WEDDING_GALLERY_IMAGES.map((img, idx) => (
                <li
                  key={idx}
                  className="glide__slide relative"
                  onClick={(e) => handleSlideClick(idx, e)}
                >
                  <div
                    className="glide-3d-card-wrapper group relative aspect-[2/3] rounded-[24px] overflow-hidden bg-[#878785] border border-stone-200/80 cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out"
                    style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
                  >
                    {img.url.includes('Carousel-02') ? (
                      <div className="w-full h-full bg-[#878785] flex items-end justify-center overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-[116%] max-w-none h-auto object-contain object-bottom -translate-x-[2%]"
                          style={{
                            WebkitMaskImage:
                              'linear-gradient(to bottom, transparent 0%, black 7%, black 100%)',
                            maskImage:
                              'linear-gradient(to bottom, transparent 0%, black 7%, black 100%)',
                          }}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    )}

                    {/* Zoom icon on center card */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/35 text-white/90 backdrop-blur-xs opacity-75 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Left / Right Navigation Arrows */}
          <div className="glide__arrows" data-glide-el="controls">
            <button
              type="button"
              className="glide__arrow glide__arrow--left absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-30"
              data-glide-dir="<"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="glide__arrow glide__arrow--right absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-30"
              data-glide-dir=">"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div
            className="glide__bullets flex items-center justify-center gap-2 pt-2"
            data-glide-el="controls[nav]"
          >
            {WEDDING_GALLERY_IMAGES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => glideInstanceRef.current?.go(`=${dotIdx}`)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeCenterIdx === dotIdx
                    ? 'w-6 bg-[#721319]'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Chuyển đến ảnh ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal when clicking the active slide */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedIdx(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white z-10 transition-colors cursor-pointer"
            aria-label="Đóng ảnh"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handlePrevLightbox}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer z-10"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-md w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/15 max-h-[78vh] flex items-center justify-center">
              <img
                src={WEDDING_GALLERY_IMAGES[selectedIdx].url}
                alt={WEDDING_GALLERY_IMAGES[selectedIdx].caption}
                className="max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>
            <p className="text-sm sm:text-base font-serif-editorial text-white mt-3 text-center">
              {WEDDING_GALLERY_IMAGES[selectedIdx].caption}
            </p>
            <span className="text-xs text-stone-400 mt-0.5 font-sans-clean">
              {selectedIdx + 1} / {WEDDING_GALLERY_IMAGES.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextLightbox}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer z-10"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
