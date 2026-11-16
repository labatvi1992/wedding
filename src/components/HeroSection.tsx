import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES, HERO_GROOM_NAME, HERO_BRIDE_NAME } from '../data/initialData';

interface HeroSectionProps {
  config: WeddingConfig;
  guestName?: string;
  onScrollToRsvp?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const heroGroom = config.heroGroomName || HERO_GROOM_NAME;
  const heroBride = config.heroBrideName || HERO_BRIDE_NAME;

  return (
    <section id="section-hero" className="relative w-full overflow-hidden bg-white select-none">
      {/* Main Studio Portrait Container (Native 2:3 DSLR ratio: 4024x6048) */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-stone-100">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          src={DEMO_IMAGES.heroCouple}
          alt={`${heroGroom} & ${heroBride}`}
          className="w-full h-full object-cover object-center"
        />

        {/* Soft top-left & bottom gradient overlays for script legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-transparent to-white/95 pointer-events-none" />

        {/* Top-left "Ngày Chung Đôi" Script Title */}
        <motion.div
          initial={{ opacity: 0, y: -18, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
          className="absolute top-6 sm:top-8 left-5 sm:left-8 z-10 pointer-events-none"
        >
          <h2 className="font-calligraphy text-[42px] sm:text-[52px] text-stone-900 leading-none tracking-normal drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)]">
            Ngày Chung Đôi
          </h2>
        </motion.div>

        {/* Bottom Script Names */}
        <div className="absolute bottom-3 sm:bottom-5 inset-x-0 px-6 sm:px-10 z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -24, rotate: -7 }}
            animate={{ opacity: 1, x: 0, rotate: -7 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="text-left"
          >
            <h1 className="font-calligraphy text-[42px] sm:text-[42px] text-stone-900 leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.95)]">
              {heroGroom}
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
            <span className="block font-calligraphy text-[42px] sm:text-[42px] text-stone-900 leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.95)]">
              {heroBride}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
