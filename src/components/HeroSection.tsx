import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES } from '../data/initialData';

interface HeroSectionProps {
  config: WeddingConfig;
  guestName?: string;
  onScrollToRsvp?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, guestName }) => {
  return (
    <section id="section-hero" className="relative w-full overflow-hidden bg-white select-none">
      {/* Main Studio Portrait Container */}
      <div className="relative w-full aspect-[3/4.2] sm:aspect-[3/4] overflow-hidden bg-stone-100">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          src={DEMO_IMAGES.heroCouple}
          alt={`${config.brideName} & ${config.groomName}`}
          className="w-full h-full object-cover object-center"
        />

        {/* Soft top-left & bottom gradient overlays for script legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-transparent to-white/95 pointer-events-none" />

        {/* Top-left "Save The Date" Script Title */}
        <motion.div
          initial={{ opacity: 0, y: -18, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
          className="absolute top-6 sm:top-8 left-5 sm:left-8 z-10 pointer-events-none"
        >
          <h2 className="font-calligraphy text-[44px] sm:text-[54px] text-stone-900 leading-none tracking-normal drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)]">
            Save The Date
          </h2>
          {guestName && (
            <p className="font-serif-editorial italic text-sm sm:text-base text-stone-800 mt-1 pl-2 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
              Thân mời: <span className="font-semibold text-[#721319]">{guestName}</span>
            </p>
          )}
        </motion.div>

        {/* Bottom Script Names: Quỳnh Hương & Minh Anh */}
        <div className="absolute bottom-3 sm:bottom-5 inset-x-0 px-6 sm:px-10 z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -24, rotate: -7 }}
            animate={{ opacity: 1, x: 0, rotate: -7 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="text-left"
          >
            <h1 className="font-calligraphy text-[46px] sm:text-[56px] text-stone-900 leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.95)]">
              {config.brideName}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
            className="pl-16 sm:pl-24 my-0.5"
          >
            <span className="font-calligraphy text-[36px] sm:text-[42px] text-stone-800 leading-none">
              &amp;
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, rotate: -6 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 0.9, delay: 0.75, ease: 'easeOut' }}
            className="text-center pl-14 sm:pl-20 -mt-1"
          >
            <span className="block font-calligraphy text-[46px] sm:text-[56px] text-stone-900 leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.95)]">
              {config.groomName}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
