import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES, CARD_BRIDE_NAME, CARD_GROOM_NAME } from '../data/initialData';
import { calculateCountdown } from '../utils/guestUtils';

interface CoupleCalendarCountdownSectionProps {
  config: WeddingConfig;
}

export const CoupleCalendarCountdownSection: React.FC<CoupleCalendarCountdownSectionProps> = ({
  config,
}) => {
  const cardBride = config.cardBrideName || CARD_BRIDE_NAME;
  const cardGroom = config.cardGroomName || CARD_GROOM_NAME;
  const [countdown, setCountdown] = useState(() => calculateCountdown(config.weddingDate));

  useEffect(() => {
    setCountdown(calculateCountdown(config.weddingDate));
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(config.weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.weddingDate]);

  const highlightDay = config.calendarHeartDay || 20;
  const daysInDecember = Array.from({ length: 31 }, (_, i) => i + 1);
  // December 2026 starts on Tuesday (Thứ 3), so 1 leading empty cell for Monday (Thứ 2)
  // This places 6, 13, 20, 27 in the 7th column (Chủ Nhật)
  const leadingEmptyCells = Array.from({ length: 1 }, (_, i) => i);
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <section id="section-calendar" className="w-full bg-white px-5 sm:px-8 pt-6 pb-8 overflow-hidden select-none">
      {/* 1. December 2026 Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="max-w-md mx-auto mb-10"
      >
        {/* Header: "Ngày chung đôi" & "Tháng 12" on the same single line */}
        <div className="flex items-baseline justify-between gap-2 mb-4 px-2">
          <div className="font-serif-editorial text-[26px] sm:text-[30px] text-stone-800 tracking-wide leading-tight whitespace-nowrap">
            Tháng 12
          </div>
        </div>

        {/* 7-Column Calendar Grid (T2 -> CN) */}
        <div className="grid grid-cols-7 gap-y-3 sm:gap-y-3.5 text-center items-center">
          {weekDays.map((wd) => (
            <div
              key={wd}
              className={`text-xs sm:text-[13px] font-sans-clean font-semibold tracking-wider pb-1 border-b border-stone-200/80 ${
                wd === 'CN' ? 'text-[#721319]' : 'text-stone-500'
              }`}
            >
              {wd}
            </div>
          ))}

          {leadingEmptyCells.map((emptyIdx) => (
            <div key={`empty-${emptyIdx}`} className="h-9" />
          ))}

          {daysInDecember.map((day) => {
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
          className="col-span-8 relative rounded-[26px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.16)] bg-stone-100 aspect-[2/3]"
        >
          <img
            src={DEMO_IMAGES.bridePortrait}
            alt={`Cô dâu ${cardBride}`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/15 to-transparent pointer-events-none" />

          {/* Bottom-left Overlay Text */}
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-3 text-left text-stone-900">
            <span className="block font-calligraphy text-[26px] sm:text-[30px] leading-none text-stone-800 mb-0.5">
              Cô dâu
            </span>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold uppercase tracking-wide text-stone-900">
              {cardBride.toUpperCase()}
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
          <h4 className="font-serif-editorial text-xl sm:text-2xl text-[#5e1418] tracking-tight mb-1 font-medium">
            Đếm Ngược
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
          className="col-span-8 relative rounded-[26px] overflow-hidden shadow-[0_14px_35px_rgba(0,0,0,0.2)] bg-stone-900 aspect-[2/3]"
        >
          <img
            src={DEMO_IMAGES.groomPortrait}
            alt={`Chú rể ${cardGroom}`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom-left White Text Overlay */}
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-3 text-left text-white">
            <span className="block font-calligraphy text-[26px] sm:text-[30px] leading-none text-white/95 mb-0.5">
              Chú rể
            </span>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium uppercase tracking-wide text-white">
              {cardGroom.toUpperCase()}
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
