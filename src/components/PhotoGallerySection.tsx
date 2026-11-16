import React, { useEffect, useRef, useState, useCallback } from 'react';
import Glide from '@glidejs/glide';
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles, Box } from 'lucide-react';
import { WEDDING_GALLERY_IMAGES } from '../data/initialData';

export const PhotoGallerySection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const glideInstanceRef = useRef<Glide | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [activeCenterIdx, setActiveCenterIdx] = useState<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Function to calculate and apply 3D transformation to all slides
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
      const shadow = slide.querySelector<HTMLElement>('.glide-3d-floor-shadow');
      if (!card) return;

      if (!is3DMode) {
        // Flat standard mode
        card.style.transform = 'none';
        card.style.opacity = '1';
        card.style.filter = 'none';
        card.style.zIndex = '1';
        card.classList.remove('is-active-3d', 'is-side-3d');
        if (shadow) shadow.style.opacity = '0';
        return;
      }

      const slideRect = slide.getBoundingClientRect();
      const slideCenterX = slideRect.left + slideRect.width / 2;
      const slideWidth = slideRect.width || 1;

      // Distance ratio from track center (-1: 1 slide to the left, 0: exact center, 1: 1 slide to the right)
      const rawDistance = (slideCenterX - trackCenterX) / slideWidth;
      const distance = Math.max(-3, Math.min(3, rawDistance));
      const absDist = Math.abs(distance);

      if (absDist < minDistance) {
        minDistance = absDist;
        const rawDataIdx = slide.getAttribute('data-gallery-idx');
        if (rawDataIdx !== null) {
          closestIdx = parseInt(rawDataIdx, 10);
        }
      }

      if (absDist < 0.35) {
        // Center active slide: prominent forward pop, 0deg tilt, intense lighting
        card.style.transform = `perspective(1200px) rotateY(0deg) scale(1.08) translateZ(45px)`;
        card.style.opacity = '1';
        card.style.filter = 'brightness(1.04) contrast(1.02)';
        card.style.zIndex = '30';
        card.classList.add('is-active-3d');
        card.classList.remove('is-side-3d');
        if (shadow) {
          shadow.style.opacity = '1';
          shadow.style.transform = 'translateZ(-15px) scale(1.08)';
        }
      } else {
        // Side slides angled in 3D perspective toward the center
        const isLeft = distance < 0;
        const angle = isLeft
          ? Math.min(36, Math.max(16, absDist * 25))
          : -Math.min(36, Math.max(16, absDist * 25));

        const scale = Math.max(0.76, 1 - absDist * 0.16);
        const translateZ = -Math.min(130, absDist * 50);
        const opacity = Math.max(0.42, 1 - absDist * 0.32);
        const brightness = Math.max(0.68, 1 - absDist * 0.24);

        card.style.transform = `perspective(1200px) rotateY(${angle.toFixed(1)}deg) scale(${scale.toFixed(2)}) translateZ(${translateZ.toFixed(0)}px)`;
        card.style.opacity = opacity.toFixed(2);
        card.style.filter = `brightness(${brightness.toFixed(2)}) saturate(0.9)`;
        card.style.zIndex = `${Math.max(1, 20 - Math.round(absDist * 5))}`;
        card.classList.remove('is-active-3d');
        card.classList.add('is-side-3d');
        if (shadow) {
          shadow.style.opacity = '0.35';
          shadow.style.transform = `translateZ(${translateZ.toFixed(0)}px) scale(${scale.toFixed(2)})`;
        }
      }
    });

    if (minDistance < 0.5) {
      setActiveCenterIdx(closestIdx);
    }
  }, [is3DMode]);

  // Handle continuous smooth updates during transitions
  const triggerTransitionFrames = useCallback(() => {
    update3DEffect();
    let frames = 0;
    const loop = () => {
      update3DEffect();
      frames++;
      if (frames < 35) {
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

    // Initialize Glide.js with center focus for 3D Coverflow
    const glide = new Glide(sliderRef.current, {
      type: 'carousel',
      startAt: 0,
      focusAt: 'center',
      perView: 3,
      gap: 20,
      autoplay: 4000,
      hoverpause: true,
      animationDuration: 650,
      animationTimingFunc: 'cubic-bezier(0.25, 1, 0.5, 1)',
      rewind: true,
      breakpoints: {
        1200: {
          perView: 3,
          gap: 16,
          focusAt: 'center',
        },
        1024: {
          perView: 2,
          peek: { before: 50, after: 50 },
          gap: 16,
          focusAt: 'center',
        },
        640: {
          perView: 1,
          peek: { before: 42, after: 42 },
          gap: 14,
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
      setTimeout(update3DEffect, 50);
    });

    glide.on('run.after', () => {
      triggerTransitionFrames();
    });

    glide.on('run', () => {
      triggerTransitionFrames();
    });

    glide.on('move.after', () => {
      update3DEffect();
    });

    glide.on('resize', () => {
      update3DEffect();
    });

    glide.mount();
    glideInstanceRef.current = glide;

    const handleWindowResize = () => {
      update3DEffect();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      try {
        glide.destroy();
      } catch {
        // Cleanup
      }
    };
  }, [triggerTransitionFrames, update3DEffect]);

  useEffect(() => {
    update3DEffect();
  }, [is3DMode, update3DEffect]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode) return;
    const target = e.currentTarget;
    if (!target.classList.contains('is-active-3d')) return;

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    target.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale(1.09) translateZ(48px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode) return;
    const target = e.currentTarget;
    if (target.classList.contains('is-active-3d')) {
      target.style.transform = `perspective(1200px) rotateY(0deg) scale(1.08) translateZ(45px)`;
    }
  };

  const handleSlideClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === activeCenterIdx) {
      setSelectedIdx(idx);
    } else {
      if (glideInstanceRef.current) {
        glideInstanceRef.current.go(`=${idx}`);
      }
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + WEDDING_GALLERY_IMAGES.length) % WEDDING_GALLERY_IMAGES.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % WEDDING_GALLERY_IMAGES.length);
    }
  };

  return (
    <section className="px-3 sm:px-8 lg:px-12 py-12 sm:py-16 bg-[#f7f4ef] text-stone-800 relative overflow-hidden select-none border-t border-stone-200/60">
      <div className="text-center space-y-1 mb-8 max-w-2xl mx-auto">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-rose-900 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Khoảnh Khắc Hạnh Phúc
        </span>
        <h2 className="font-script text-4xl sm:text-5xl lg:text-6xl text-rose-950 font-semibold">
          Album Ảnh Cưới
        </h2>
        <div className="w-12 h-0.5 bg-rose-800/40 mx-auto rounded-full my-3" />
        <p className="text-xs sm:text-sm text-stone-600 font-serif italic">
          "Lưu giữ từng ánh nhìn và nụ cười rực rỡ nhất trong hành trình yêu."
        </p>

        {/* 3D Mode Status & Interactive Switcher */}
        <div className="pt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${is3DMode
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900'
              }`}
            title="Bật/Tắt chế độ xem 3D Coverflow"
          >
            <Box className={`w-3.5 h-3.5 ${is3DMode ? 'text-amber-700 animate-pulse' : 'text-stone-400'}`} />
            <span>Hiệu ứng 3D Glide: {is3DMode ? 'Đang Bật (Coverflow)' : 'Chế độ phẳng'}</span>
          </button>
        </div>
      </div>

      {/* Glide.js 3D Carousel Stage */}
      <div className="max-w-5xl mx-auto relative px-2 sm:px-6 glide-3d-stage">
        <div ref={sliderRef} className="glide">

          {/* Glide Track with generous vertical space for 3D tilting and shadows */}
          <div className="glide__track py-8 sm:py-10 glide-3d-track" data-glide-el="track">
            <ul className="glide__slides flex">
              {WEDDING_GALLERY_IMAGES.map((img, idx) => (
                <li
                  key={idx}
                  className="glide__slide relative"
                  onClick={(e) => handleSlideClick(idx, e)}
                >
                  {/* 3D Card Wrapper with perspective and tilt */}
                  <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="glide-3d-card-wrapper group relative aspect-[2/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200/90 cursor-pointer shadow-lg transition-all duration-300"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Active Highlight Badge on 3D Center Card */}
                    {idx === activeCenterIdx && is3DMode && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-900/90 border border-amber-300/80 text-[10px] sm:text-xs text-amber-200 font-semibold flex items-center gap-1 shadow-md backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Nổi Bật</span>
                      </div>
                    )}

                    {/* Gradient Overlay & Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                      <span className="text-[10px] sm:text-xs text-amber-300 font-medium uppercase tracking-wider">
                        {img.category}
                      </span>
                      <p className="text-xs sm:text-sm text-white font-serif line-clamp-2">
                        {img.caption}
                      </p>
                      <span className="text-[10px] text-rose-200/90 mt-1 font-sans">
                        {idx === activeCenterIdx ? 'Nhấn để phóng to' : 'Nhấn để đưa vào trung tâm'}
                      </span>
                    </div>

                    {/* Magnify Icon */}
                    <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white/90 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 3D Floor Shadow under each card for depth */}
                  <div className="glide-3d-floor-shadow" />
                </li>
              ))}
            </ul>
          </div>

          {/* Glide Arrows (Controls) */}
          <div className="glide__arrows" data-glide-el="controls">
            <button
              className="glide__arrow glide__arrow--left absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-rose-900 text-stone-800 hover:text-white border border-stone-200 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer z-30"
              data-glide-dir="<"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              className="glide__arrow glide__arrow--right absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-rose-900 text-stone-800 hover:text-white border border-stone-200 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer z-30"
              data-glide-dir=">"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Glide Bullets (Dots Navigation) */}
          <div
            className="glide__bullets flex items-center justify-center gap-2 pt-2"
            data-glide-el="controls[nav]"
          >
            {WEDDING_GALLERY_IMAGES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                className="glide__bullet w-2.5 h-2.5 rounded-full bg-stone-300 hover:bg-amber-600 transition-all cursor-pointer"
                data-glide-dir={`=${dotIdx}`}
                aria-label={`Chuyển đến ảnh ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedIdx(null)}
        >
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors cursor-pointer"
            aria-label="Đóng ảnh"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10">
              <img
                src={WEDDING_GALLERY_IMAGES[selectedIdx].url}
                alt={WEDDING_GALLERY_IMAGES[selectedIdx].caption}
                className={`max-w-full max-h-[72vh] ${WEDDING_GALLERY_IMAGES[selectedIdx].url.includes('Screenshot')
                    ? 'object-fill aspect-[4/5] scale-[1.35] translate-y-[-5%]'
                    : 'object-contain'
                  }`}
              />
            </div>
            <p className="text-sm sm:text-base font-serif text-rose-200 mt-4 text-center px-4">
              {WEDDING_GALLERY_IMAGES[selectedIdx].caption}
            </p>
            <span className="text-xs text-stone-400 mt-1 font-mono">
              {selectedIdx + 1} / {WEDDING_GALLERY_IMAGES.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};
