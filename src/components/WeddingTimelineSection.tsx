import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES, LOVE_STORY_STEPS } from '../data/initialData';

interface WeddingTimelineSectionProps {
  config: WeddingConfig;
  onOpenRsvpModal?: () => void;
}

export const WeddingTimelineSection: React.FC<WeddingTimelineSectionProps> = ({
  config,
  onOpenRsvpModal,
}) => {
  const timelineEvents = LOVE_STORY_STEPS.map((step, idx) => ({
    num: idx + 1,
    time: step.year,
    title: step.title,
    subtitle: step.desc,
    align: idx % 2 === 0 ? ('left' as const) : ('right' as const),
  }));

  return (
    <section id="section-timeline" className="w-full bg-white text-stone-900 pt-10 pb-0 select-none">
      <div className="px-4 sm:px-8 max-w-md mx-auto">
        {/* Section Heading: "Thời gian" */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif-editorial text-[40px] sm:text-[46px] text-stone-900 font-light tracking-tight">
            Thời gian
          </h2>
        </motion.div>

        {/* Vertical Timeline Tree */}
        <div className="relative max-w-xs sm:max-w-sm mx-auto py-2">
          {/* Central Vertical Crimson Line */}
          <div className="absolute left-1/2 top-5 bottom-8 -translate-x-1/2 w-[2px] bg-[#641217]" />

          <div className="space-y-12 sm:space-y-14 relative z-10">
            {timelineEvents.map((ev, idx) => (
              <motion.div
                key={ev.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.65, delay: idx * 0.15, ease: 'easeOut' }}
                className="grid grid-cols-11 items-start"
              >
                {/* Left Side (5 cols) */}
                <div className="col-span-5 pr-3 text-right">
                  {ev.align === 'left' && (
                    <div className="space-y-0.5">
                      <span className="block font-sans-clean font-bold text-sm sm:text-[15px] text-[#641217]">
                        {ev.time}
                      </span>
                      <h3 className="font-sans-clean font-bold text-base sm:text-lg text-stone-900 leading-snug">
                        {ev.title}
                      </h3>
                      <p className="font-sans-clean text-xs sm:text-sm text-stone-600">
                        {ev.subtitle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center Node (1 col) */}
                <div className="col-span-1 flex justify-center pt-0.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#641217] text-white flex items-center justify-center font-sans-clean font-semibold text-sm sm:text-base shadow-sm">
                    {ev.num}
                  </div>
                </div>

                {/* Right Side (5 cols) */}
                <div className="col-span-5 pl-3 text-left">
                  {ev.align === 'right' && (
                    <div className="space-y-0.5">
                      <span className="block font-sans-clean font-bold text-sm sm:text-[15px] text-[#641217]">
                        {ev.time}
                      </span>
                      <h3 className="font-sans-clean font-bold text-base sm:text-lg text-stone-900 leading-snug">
                        {ev.title}
                      </h3>
                      <p className="font-sans-clean text-xs sm:text-sm text-stone-600">
                        {ev.subtitle}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing RSVP Note matching video (0:43 - 0:46) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.2 }}
          onClick={onOpenRsvpModal}
          className="mt-10 mb-10 text-center space-y-1.5 px-2 cursor-pointer group"
          title="Nhấn để gửi lời chúc hoặc xác nhận tham dự"
        >
          <p className="font-serif-editorial text-[13px] sm:text-[14.5px] uppercase tracking-[0.04em] text-stone-800 leading-relaxed group-hover:text-[#721319] transition-colors">
            BẠN NHỚ NHẮN LẠI GIÚP MỘT TIẾNG NHÉ, ĐỂ HAI ĐỨA LO SẴN PHẦN CỖ VÀ CHỖ NGỒI CHO BẠN.
          </p>
          <p className="font-serif-editorial text-[14px] sm:text-[15px] uppercase tracking-[0.06em] text-stone-900 font-medium">
            TRÂN TRỌNG!
          </p>
        </motion.div>
      </div>

      {/* Full-Width Closing "forever" Portrait (Native 2:3 ratio) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1 }}
        className="relative w-full aspect-[2/3] overflow-hidden bg-stone-100"
      >
        <img
          src={DEMO_IMAGES.coupleForever}
          alt={`${config.brideName} & ${config.groomName} forever`}
          className="w-full h-full object-cover object-center"
        />

        {/* Delicate white handwritten "mãi bên nhau" signature on the right side */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="absolute top-[28%] right-3 sm:right-5 pointer-events-none"
        >
          <span className="font-calligraphy text-[34px] sm:text-[42px] text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] tracking-wide">
            mãi bên nhau
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};
