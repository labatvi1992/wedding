import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES } from '../data/initialData';
import { calculateCountdown } from '../utils/guestUtils';

interface CoupleCalendarCountdownSectionProps {
  config: WeddingConfig;
}

export const CoupleCalendarCountdownSection: React.FC<CoupleCalendarCountdownSectionProps> = ({
  config,
}) => {
  const [countdown, setCountdown] = useState(() => calculateCountdown(config.weddingDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(config.weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.weddingDate]);

  const highlightDay = config.calendarHeartDay || 26;
  const daysInOctober = Array.from({ length: 31 }, (_, i) => i + 1);
  // 5 leading empty cells so 1 & 2 sit in the last two columns of row 1
  const leadingEmptyCells = Array.from({ length: 5 }, (_, i) => i);

  return (
    <section id="section-calendar" className="w-full bg-white px-5 sm:px-8 pt-6 pb-8 overflow-hidden select-none">
      {/* 1. October Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="max-w-md mx-auto mb-10"
      >
        {/* Header: "Our wedding day" & "Tháng 10" */}
        <div className="flex items-start justify-between mb-3 px-2">
          <div className="font-calligraphy text-[31px] sm:text-[36px] text-stone-800 leading-[1.05]">
            <span className="block">Our wedding</span>
            <span className="block pl-1">day</span>
          </div>
          <div className="font-serif-editorial text-[30px] sm:text-[34px] text-stone-800 tracking-wide pt-1 pr-2">
            Tháng 10
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-3.5 sm:gap-y-4 text-center items-center">
          {leadingEmptyCells.map((emptyIdx) => (
            <div key={`empty-${emptyIdx}`} className="h-9" />
          ))}

          {daysInOctober.map((day) => {
            const isHeartDay = day === highlightDay;
            return (
              <div
                key={day}
                className="relative flex items-center justify-center h-9 sm:h-10 text-[15px] sm:text-base font-sans-clean font-medium text-stone-800"
              >
                {isHeartDay ? (
                  <motion.div
                    initial={{ scale: 0.85 }}
                    whileInView={{ scale: [1, 1.12, 1] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                    className="relative flex items-center justify-center w-11 h-11"
                  >
                    <svg
                      viewBox="0 0 36 32"
                      className="absolute inset-0 w-full h-full text-[#f28b96] fill-current drop-shadow-xs"
                    >
                      <path d="M18 29.5C18 29.5 3.5 20.2 3.5 10.3C3.5 5.4 7.4 1.5 12.1 1.5C14.9 1.5 17.4 2.9 18 5.1C18.6 2.9 21.1 1.5 23.9 1.5C28.6 1.5 32.5 5.4 32.5 10.3C32.5 20.2 18 29.5 18 29.5Z" />
                    </svg>
                    <span className="relative z-10 text-white text-xs sm:text-sm font-semibold leading-none -mt-0.5">
                      {day}
                    </span>
                  </motion.div>
                ) : (
                  <span>{day}</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 2. Bride Card + Vertical Countdown Column */}
      <div className="grid grid-cols-12 gap-3 sm:gap-5 items-center mb-8 sm:mb-10">
        {/* Left: Bride Portrait Card (8 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="col-span-8 relative rounded-[26px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.16)] bg-stone-100 aspect-[3/4.1]"
        >
          <img
            src={DEMO_IMAGES.bridePortrait}
            alt={`Cô dâu ${config.brideName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/15 to-transparent pointer-events-none" />

          {/* Bottom-left Overlay Text */}
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-3 text-left text-stone-900">
            <span className="block font-calligraphy text-[26px] sm:text-[30px] leading-none text-stone-800 mb-0.5">
              Cô dâu
            </span>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold uppercase tracking-wide text-stone-900">
              {config.brideName.toUpperCase()}
            </h3>
          </div>
        </motion.div>

        {/* Right: Vertical Countdown Column (4 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="col-span-4 flex flex-col items-center justify-center space-y-3 sm:space-y-3.5"
        >
          <h4 className="font-serif-editorial text-2xl sm:text-[28px] text-[#5e1418] tracking-tight mb-1">
            Countdown
          </h4>

          {[
            { value: countdown.days, label: 'Ngày' },
            { value: countdown.hours, label: 'Giờ' },
            { value: countdown.minutes, label: 'Phút' },
            { value: countdown.seconds, label: 'Giây' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 + idx * 0.1 }}
              className="w-full max-w-[92px] sm:max-w-[104px] py-2.5 sm:py-3 px-2 rounded-xl bg-[#540d12] text-white text-center shadow-md"
            >
              <span className="text-xs sm:text-sm font-medium tracking-wide tabular-nums whitespace-nowrap">
                {item.value} {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 3. Groom Portrait Card (Offset Right) */}
      <div className="grid grid-cols-12">
        <div className="col-span-4" />
        <motion.div
          initial={{ opacity: 0, x: 35, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="col-span-8 relative rounded-[26px] overflow-hidden shadow-[0_14px_35px_rgba(0,0,0,0.2)] bg-stone-900 aspect-[3/4.1]"
        >
          <img
            src={DEMO_IMAGES.groomPortrait}
            alt={`Chú rể ${config.groomName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom-left White Text Overlay */}
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-3 text-left text-white">
            <span className="block font-calligraphy text-[26px] sm:text-[30px] leading-none text-white/95 mb-0.5">
              Chú rể
            </span>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium uppercase tracking-wide text-white">
              {config.groomName.toUpperCase()}
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
