import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { WEDDING_GALLERY_IMAGES } from '../data/initialData';

// Build a circular ring with at least 7 slots so wrap-around happens at
// distance >= 3.5 (completely off-screen), eliminating any last-slide jump.
const TOTAL_IMAGES = WEDDING_GALLERY_IMAGES.length;
const RING_MULTIPLIER = TOTAL_IMAGES >= 6 ? 1 : 2;
const RING_LENGTH = TOTAL_IMAGES * RING_MULTIPLIER;
const RING_ITEMS = Array.from({ length: RING_LENGTH }, (_, slotIdx) => ({
  slotIdx,
  imageIdx: slotIdx % TOTAL_IMAGES,
  data: WEDDING_GALLERY_IMAGES[slotIdx % TOTAL_IMAGES],
}));

interface PhotoGallerySectionProps {
  variant?: 'default' | 'hero';
  topOverlay?: React.ReactNode;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  variant = 'default',
  topOverlay,
}) => {
  const isHero = variant === 'hero';
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Continuous floating-point position along the infinite circular ring
  const currentPosRef = useRef<number>(0);
  const targetPosRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartPosRef = useRef<number>(0);
  const dragMovedRef = useRef<boolean>(false);
  const lastDragTimeRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);
  const lastPointerXRef = useRef<number>(0);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [activeCenterIdx, setActiveCenterIdx] = useState<number>(0);

  // Normalize any integer/float position to [0, TOTAL_IMAGES - 1]
  const getNormalizedImageIdx = useCallback((pos: number) => {
    const rounded = Math.round(pos);
    return ((rounded % TOTAL_IMAGES) + TOTAL_IMAGES) % TOTAL_IMAGES;
  }, []);

  // Compute and apply smooth slide transforms (full-bleed on hero, 3D coverflow on default)
  const render3DFrame = useCallback(() => {
    const pos = currentPosRef.current;
    const stageWidth = stageRef.current?.clientWidth || 420;
    const horizontalStep = isHero
      ? stageWidth
      : Math.max(155, Math.min(210, stageWidth * 0.44));

    RING_ITEMS.forEach(({ slotIdx }) => {
      const el = cardRefs.current[slotIdx];
      if (!el) return;

      // Shortest signed circular distance in [-RING_LENGTH/2, +RING_LENGTH/2]
      let diff = (slotIdx - pos) % RING_LENGTH;
      if (diff > RING_LENGTH / 2) diff -= RING_LENGTH;
      if (diff < -RING_LENGTH / 2) diff += RING_LENGTH;

      const absDiff = Math.abs(diff);

      if (isHero) {
        if (absDiff > 1.35) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.zIndex = '0';
          el.style.transform = `translate3d(${(diff * stageWidth).toFixed(1)}px, 0px, 0px)`;
          el.style.filter = 'none';
          return;
        }

        const translateX = diff * stageWidth;
        const opacity = Math.max(0.85, 1 - absDiff * 0.15);
        const zIndex = absDiff < 0.5 ? 20 : 10;

        el.style.transform = `translate3d(${translateX.toFixed(2)}px, 0px, 0px)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = 'none';
        el.style.zIndex = `${zIndex}`;
        el.style.pointerEvents = absDiff < 0.5 ? 'auto' : 'none';
        return;
      }

      // Hide slots on the far back side of the ring so wrap-around is invisible
      if (absDiff > 2.2) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '0';
        el.style.transform = `perspective(1100px) translate3d(${(diff * horizontalStep).toFixed(1)}px, 0px, 0px) scale(0.7)`;
        return;
      }

      // Smooth continuous interpolation across center (0) and side cards (±1, ±2)
      const translateX = diff * horizontalStep;
      const rotateY = -diff * 28; // Left card tilts +28deg, right card tilts -28deg
      const clampedRotateY = Math.max(-34, Math.min(34, rotateY));
      const scale = Math.max(0.78, 1 - absDiff * 0.16);
      const opacity = Math.max(0.46, Math.min(1, 1 - absDiff * 0.36));
      const brightness = Math.max(0.75, 1.02 - absDiff * 0.2);
      const zIndex = Math.round(30 - absDiff * 10);

      el.style.transform = `perspective(1100px) translate3d(${translateX.toFixed(2)}px, 0px, 0px) rotateY(${clampedRotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(2)})`;
      el.style.zIndex = `${Math.max(1, zIndex)}`;
      el.style.pointerEvents = absDiff < 1.35 ? 'auto' : 'none';
    });
  }, [isHero]);

  // Smooth animation loop towards targetPosRef
  const startAnimationLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const tick = () => {
      if (!isDraggingRef.current) {
        const diff = targetPosRef.current - currentPosRef.current;
        const snapThreshold = isHero ? 0.003 : 0.0015;
        const lerpFactor = isHero ? 0.24 : 0.14;
        if (Math.abs(diff) > snapThreshold) {
          currentPosRef.current += diff * lerpFactor;
          render3DFrame();
          animFrameRef.current = requestAnimationFrame(tick);
          return;
        } else {
          currentPosRef.current = targetPosRef.current;
          render3DFrame();
        }
      }
      animFrameRef.current = null;
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [isHero, render3DFrame]);

  // Step forward/backward by `delta` slides seamlessly
  const stepBy = useCallback(
    (delta: number) => {
      targetPosRef.current = Math.round(targetPosRef.current + delta);
      setActiveCenterIdx(getNormalizedImageIdx(targetPosRef.current));
      startAnimationLoop();
    },
    [getNormalizedImageIdx, startAnimationLoop]
  );

  // Jump to specific dot index via shortest circular path
  const goToDot = useCallback(
    (dotIdx: number) => {
      const currentNorm = getNormalizedImageIdx(targetPosRef.current);
      let delta = dotIdx - currentNorm;
      if (delta > TOTAL_IMAGES / 2) delta -= TOTAL_IMAGES;
      if (delta < -TOTAL_IMAGES / 2) delta += TOTAL_IMAGES;
      stepBy(delta);
    },
    [getNormalizedImageIdx, stepBy]
  );

  // Initial render & resize listener
  useEffect(() => {
    render3DFrame();
    const handleResize = () => render3DFrame();
    window.addEventListener('resize', handleResize);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      observer = new ResizeObserver(() => render3DFrame());
      observer.observe(stageRef.current);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [render3DFrame]);

  // Autoplay every 3.5s without any reset glitch
  useEffect(() => {
    if (selectedIdx !== null) return;
    const timer = setInterval(() => {
      if (!isDraggingRef.current && !isHoveredRef.current) {
        stepBy(1);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [selectedIdx, stepBy]);

  // Strict scroll lock & keyboard navigation while fullscreen lightbox is open
  useEffect(() => {
    if (selectedIdx === null) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overscrollBehavior = 'none';

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIdx(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) =>
          prev === null ? null : (prev - 1 + TOTAL_IMAGES) % TOTAL_IMAGES
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) =>
          prev === null ? null : (prev + 1) % TOTAL_IMAGES
        );
      } else if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageDown' ||
        e.key === 'PageUp' ||
        e.key === ' '
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      body.style.overscrollBehavior = prevBodyOverscroll;
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
    };
  }, [selectedIdx !== null]);

  // Pointer / Touch drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on navigation arrow buttons
    if ((e.target as HTMLElement).closest('button')) return;

    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    dragStartPosRef.current = currentPosRef.current;
    lastDragTimeRef.current = performance.now();
    dragVelocityRef.current = 0;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (!dragMovedRef.current && Math.abs(dx) > 6) {
      dragMovedRef.current = true;
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        // Ignore if pointer cannot be captured
      }
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    dragVelocityRef.current = (e.clientX - lastPointerXRef.current) / dt;
    lastPointerXRef.current = e.clientX;
    lastDragTimeRef.current = now;

    const stageWidth = stageRef.current?.clientWidth || 420;
    const dragSensitivity = isHero ? stageWidth : Math.max(180, stageWidth * 0.52);

    currentPosRef.current = dragStartPosRef.current - dx / dragSensitivity;
    render3DFrame();
  };

  const finishDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const draggedSlides = currentPosRef.current - dragStartPosRef.current;
    const velocityBoost = -dragVelocityRef.current * 0.22;
    const projected = currentPosRef.current + velocityBoost;

    let snapped: number;
    if (Math.abs(draggedSlides) > 0.18 || Math.abs(dragVelocityRef.current) > 0.35) {
      snapped =
        draggedSlides + velocityBoost > 0
          ? Math.ceil(dragStartPosRef.current)
          : Math.floor(dragStartPosRef.current);
    } else {
      snapped = Math.round(projected);
    }

    targetPosRef.current = snapped;
    setActiveCenterIdx(getNormalizedImageIdx(snapped));
    startAnimationLoop();
  };

  const handleCardClick = (slotIdx: number, imageIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragMovedRef.current) return;

    // Check distance of clicked slot from current center
    let diff = (slotIdx - targetPosRef.current) % RING_LENGTH;
    if (diff > RING_LENGTH / 2) diff -= RING_LENGTH;
    if (diff < -RING_LENGTH / 2) diff += RING_LENGTH;

    if (Math.abs(diff) < 0.35) {
      setSelectedIdx(imageIdx);
    } else {
      stepBy(Math.round(diff));
    }
  };

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + TOTAL_IMAGES) % TOTAL_IMAGES);
    }
  };

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % TOTAL_IMAGES);
    }
  };

  return (
    <div
      data-testid="photo-carousel-3d"
      className={
        isHero
          ? 'w-full pt-0 pb-2 bg-transparent relative overflow-hidden select-none'
          : 'w-full pt-9 pb-11 bg-white relative overflow-hidden select-none'
      }
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      {/* Section Heading (hidden when embedded in Hero poster) */}
      {!isHero && (
        <div className="text-center mb-4 px-4">
          <h3 className="font-calligraphy text-[32px] sm:text-[36px] text-[#721319] leading-tight">
            Khoảnh khắc hạnh phúc
          </h3>
          <p className="font-serif-editorial italic text-xs sm:text-sm text-stone-500">
            Vuốt ngang để xem bộ ảnh 3D
          </p>
        </div>
      )}

      {/* Carousel Stage with isolated stacking context */}
      <div className={`relative z-10 isolate w-full glide-3d-stage ${isHero ? 'mt-0 mb-1' : 'my-5'}`}>
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className={`relative w-full ${
            isHero ? 'py-0 overflow-hidden' : 'py-10 overflow-visible'
          } flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing`}
        >
          {/* Invisible sizing spacer matching the active slide width */}
          <div
            className={`${
              isHero
                ? 'w-full'
                : 'w-[calc(100%-128px)] sm:w-[calc(100%-156px)]'
            } aspect-[2/3] pointer-events-none opacity-0`}
          />

          {/* Circular Slides Ring */}
          {RING_ITEMS.map(({ slotIdx, imageIdx, data }) => (
            <div
              key={slotIdx}
              ref={(el) => {
                cardRefs.current[slotIdx] = el;
              }}
              onClick={(e) => handleCardClick(slotIdx, imageIdx, e)}
              className={`glide-3d-card-wrapper group absolute ${
                isHero
                  ? 'inset-0 w-full h-full rounded-none border-0 shadow-none'
                  : 'w-[calc(100%-128px)] sm:w-[calc(100%-156px)] aspect-[2/3] rounded-[22px] border border-stone-200/80 shadow-[0_14px_34px_rgba(0,0,0,0.22)]'
              } overflow-hidden bg-[#878785] cursor-pointer`}
              style={{
                willChange: 'transform, opacity, filter',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={data.url}
                alt={data.caption}
                draggable={false}
                className="w-full h-full object-cover object-center pointer-events-none select-none"
              />

              {/* Zoom button on slide */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIdx(imageIdx);
                }}
                aria-label="Phóng to ảnh"
                title="Phóng to ảnh"
                className={`absolute ${
                  isHero ? 'bottom-3 right-3' : 'top-3 right-3'
                } z-20 p-2 rounded-full bg-black/45 hover:bg-[#721319] text-white/95 border border-white/25 backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-all active:scale-95 cursor-pointer`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Optional absolute top overlay inside the Carousel stage */}
          {topOverlay}

          {/* Left / Right Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepBy(-1);
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-40 ${
              isHero
                ? 'bg-white/85 hover:bg-[#721319] text-[#721319] hover:text-white border border-white/60'
                : 'bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80'
            }`}
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepBy(1);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-40 ${
              isHero
                ? 'bg-white/85 hover:bg-[#721319] text-[#721319] hover:text-white border border-white/60'
                : 'bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80'
            }`}
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className={`flex items-center justify-center gap-2 ${isHero ? 'pt-3 pb-1' : 'pt-1.5'}`}>
          {WEDDING_GALLERY_IMAGES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => goToDot(dotIdx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeCenterIdx === dotIdx
                  ? 'w-6 bg-[#721319]'
                  : isHero
                  ? 'w-2 bg-[#721319]/25 hover:bg-[#721319]/45'
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Chuyển đến ảnh ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal portaled to document.body above all page elements */}
      {selectedIdx !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh cưới phóng to"
            data-testid="carousel-lightbox"
            className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex items-center justify-center p-4 overscroll-none touch-none select-none"
            onClick={() => setSelectedIdx(null)}
          >
            {/* Top-right Close button with explicit "Đóng" label */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(null);
              }}
              className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 hover:bg-[#721319] text-white border border-white/30 shadow-lg backdrop-blur-md text-sm font-sans-clean font-medium transition-all active:scale-95 cursor-pointer"
              aria-label="Đóng ảnh"
              title="Đóng phóng to"
            >
              <X className="w-4 h-4 stroke-[2.4]" />
              <span>Đóng</span>
            </button>

            <button
              type="button"
              onClick={handlePrevLightbox}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 text-white transition-colors cursor-pointer z-20"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className="max-w-md w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative inline-flex overflow-hidden rounded-2xl shadow-2xl border border-white/20 max-h-[80vh] items-center justify-center bg-black">
                <img
                  src={WEDDING_GALLERY_IMAGES[selectedIdx].url}
                  alt={WEDDING_GALLERY_IMAGES[selectedIdx].caption}
                  className="max-h-[80vh] w-auto max-w-full object-contain block"
                />
              </div>
              <p className="text-sm sm:text-base font-serif-editorial text-white mt-3 text-center">
                {WEDDING_GALLERY_IMAGES[selectedIdx].caption}
              </p>
              <span className="text-xs text-stone-400 mt-0.5 font-sans-clean">
                {selectedIdx + 1} / {TOTAL_IMAGES}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextLightbox}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 text-white transition-colors cursor-pointer z-20"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
