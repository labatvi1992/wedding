import React, { useEffect, useRef, useState, useCallback } from 'react';
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

export const PhotoGallerySection: React.FC = () => {
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

  // Compute and apply 3D Coverflow transforms for all 8 circular slots at 60fps
  const render3DFrame = useCallback(() => {
    const pos = currentPosRef.current;
    const stageWidth = stageRef.current?.clientWidth || 420;
    // Horizontal spacing between adjacent 3D cards
    const horizontalStep = Math.max(155, Math.min(210, stageWidth * 0.44));

    RING_ITEMS.forEach(({ slotIdx }) => {
      const el = cardRefs.current[slotIdx];
      if (!el) return;

      // Shortest signed circular distance in [-RING_LENGTH/2, +RING_LENGTH/2]
      let diff = (slotIdx - pos) % RING_LENGTH;
      if (diff > RING_LENGTH / 2) diff -= RING_LENGTH;
      if (diff < -RING_LENGTH / 2) diff += RING_LENGTH;

      const absDiff = Math.abs(diff);

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
  }, []);

  // Smooth animation loop towards targetPosRef
  const startAnimationLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const tick = () => {
      if (!isDraggingRef.current) {
        const diff = targetPosRef.current - currentPosRef.current;
        if (Math.abs(diff) > 0.0015) {
          currentPosRef.current += diff * 0.14;
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
  }, [render3DFrame]);

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
    return () => {
      window.removeEventListener('resize', handleResize);
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

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      dragMovedRef.current = true;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    dragVelocityRef.current = (e.clientX - lastPointerXRef.current) / dt;
    lastPointerXRef.current = e.clientX;
    lastDragTimeRef.current = now;

    const stageWidth = stageRef.current?.clientWidth || 420;
    const dragSensitivity = Math.max(180, stageWidth * 0.52);

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
      className="w-full pt-9 pb-11 bg-white relative overflow-hidden select-none"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      {/* Section Heading */}
      <div className="text-center mb-4 px-4">
        <h3 className="font-calligraphy text-[32px] sm:text-[36px] text-[#721319] leading-tight">
          Khoảnh khắc hạnh phúc
        </h3>
        <p className="font-serif-editorial italic text-xs sm:text-sm text-stone-500">
          Vuốt ngang để xem album ảnh 3D
        </p>
      </div>

      {/* 3D Coverflow Stage with +20px vertical margin/padding and isolated stacking context */}
      <div className="relative z-10 isolate w-full glide-3d-stage my-5">
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className="relative w-full py-10 flex items-center justify-center overflow-visible touch-pan-y cursor-grab active:cursor-grabbing"
        >
          {/* Invisible sizing spacer matching the active center card width (narrowed by 20px each side via horizontal padding) */}
          <div className="w-[calc(100%-128px)] sm:w-[calc(100%-156px)] aspect-[2/3] pointer-events-none opacity-0" />

          {/* Circular 3D Cards Ring */}
          {RING_ITEMS.map(({ slotIdx, imageIdx, data }) => (
            <div
              key={slotIdx}
              ref={(el) => {
                cardRefs.current[slotIdx] = el;
              }}
              onClick={(e) => handleCardClick(slotIdx, imageIdx, e)}
              className="glide-3d-card-wrapper group absolute w-[calc(100%-128px)] sm:w-[calc(100%-156px)] aspect-[2/3] rounded-[24px] overflow-hidden bg-[#878785] border border-stone-200/80 cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
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

              {/* Zoom icon on card */}
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/35 text-white/90 backdrop-blur-xs opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}

          {/* Left / Right Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepBy(-1);
            }}
            className=" absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-40"
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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#721319] text-stone-800 hover:text-white border border-stone-200/80 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all active:scale-95 cursor-pointer z-40"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {WEDDING_GALLERY_IMAGES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => goToDot(dotIdx)}
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

      {/* Fullscreen Lightbox Modal when clicking the active slide */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
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
              {selectedIdx + 1} / {TOTAL_IMAGES}
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
