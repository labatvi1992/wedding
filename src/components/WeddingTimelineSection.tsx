import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES, LOVE_STORY_STEPS } from '../data/initialData';

interface WeddingTimelineSectionProps {
  config: WeddingConfig;
  guestName?: string;
  onOpenRsvpModal?: () => void;
}

export const WeddingTimelineSection: React.FC<WeddingTimelineSectionProps> = ({
  guestName,
  onOpenRsvpModal,
}) => {
  const timelineEvents = LOVE_STORY_STEPS.map((step, idx) => ({
    num: idx + 1,
    time: step.year,
    title: step.title,
    subtitle: step.desc,
    align: idx % 2 === 0 ? ('left' as const) : ('right' as const),
  }));

  const displayGuestName = guestName?.trim() || 'Quý khách';

  return (
    <section id="section-timeline" className="w-full bg-white text-stone-900 pt-6 pb-8 select-none">
      <div className="px-4 sm:px-8 max-w-md mx-auto">
        {/* Formal Personalized Invitation Callout before "Thời gian" */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          onClick={onOpenRsvpModal}
          className="text-center mb-8 px-4 py-5 rounded-2xl bg-stone-50/85 border border-stone-200/80 shadow-2xs cursor-pointer group hover:border-[#721319]/30 transition-all"
          title="Nhấn để mở biểu mẫu Xác nhận tham dự"
        >
          {/* Subtle ornamental divider */}
          <div className="flex items-center justify-center gap-2.5 mb-2.5">
            <span className="h-px w-10 bg-stone-300 group-hover:bg-[#721319]/40 transition-colors" />
            <span className="text-[#721319] text-xs leading-none">✦</span>
            <span className="h-px w-10 bg-stone-300 group-hover:bg-[#721319]/40 transition-colors" />
          </div>

          <p className="font-serif-editorial italic text-[18px] sm:text-[20px] text-stone-800 leading-[1.65]">
            Trân trọng kính mời{' '}
            <span className="font-semibold not-italic text-[#721319] underline decoration-[#721319]/35 underline-offset-4">
              {displayGuestName}
            </span>{' '}
            đến tham dự buổi tiệc rượu chung vui cùng gia đình chúng tôi.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRsvpModal?.();
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-sans-clean font-semibold text-[#721319] hover:text-[#540d12] underline decoration-[#721319]/45 underline-offset-4 cursor-pointer transition-colors"
          >
            <span>Xác nhận tham dự tại đây</span>
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>

        {/* Section Heading: "Thời gian" */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
          <h2 className="font-calligraphy text-[32px] sm:text-[36px] text-[#721319] leading-tight">
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
      </div>
    </section>
  );
};

export const WeddingClosingSection: React.FC<WeddingTimelineSectionProps> = ({
  config,
  onOpenRsvpModal,
}) => {
  return (
    <section id="section-closing" className="w-full bg-white text-stone-900 pt-2 pb-0 select-none">
      <div className="px-4 sm:px-8 max-w-md mx-auto">
        {/* Formal & Polite Closing RSVP Note */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          onClick={onOpenRsvpModal}
          className="mt-2 mb-10 text-center px-3 py-5 rounded-2xl bg-stone-50/75 border border-stone-200/80 shadow-2xs cursor-pointer group hover:border-[#721319]/30 transition-all"
          title="Nhấn để xác nhận tham dự"
        >
          {/* Subtle ornamental divider */}
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <span className="h-px w-10 bg-stone-300 group-hover:bg-[#721319]/40 transition-colors" />
            <span className="text-[#721319] text-xs leading-none">✦</span>
            <span className="h-px w-10 bg-stone-300 group-hover:bg-[#721319]/40 transition-colors" />
          </div>

          <p className="font-serif-editorial italic text-[17px] sm:text-[18.5px] text-stone-800 leading-[1.65] group-hover:text-stone-900 transition-colors">
            Sự hiện diện của Quý khách là niềm vinh hạnh lớn lao đối với gia đình chúng tôi. Rất mong Quý khách dành chút thời gian xác nhận tham dự để gia đình có sự tiếp đón chu đáo và trọn vẹn nhất.
          </p>

          <p className="font-calligraphy text-[28px] sm:text-[32px] text-[#721319] leading-tight pt-2.5">
            Trân trọng cảm ơn!
          </p>
        </motion.div>
      </div>

      {/* Full-Width Closing "forever" Photo (Native 3:2 ratio: 6048 x 4024) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1 }}
        className="relative w-full aspect-[3/2] overflow-hidden bg-stone-100"
      >
        <img
          src={DEMO_IMAGES.coupleForever}
          alt={`${config.groomName} & ${config.brideName} mãi bên nhau`}
          className="w-full h-full object-cover object-center"
        />

        {/* Delicate white handwritten "mãi bên nhau" signature on the right side */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="absolute top-[24%] right-3 sm:right-5 pointer-events-none"
        >
          <span className="font-calligraphy text-[32px] sm:text-[40px] text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
            mãi bên nhau
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

