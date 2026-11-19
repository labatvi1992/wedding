import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import {
  HERO_GROOM_NAME,
  HERO_BRIDE_NAME,
  INVITATION_GROOM_NAME,
  INVITATION_BRIDE_NAME,
} from '../data/initialData';
import { PhotoGallerySection } from './PhotoGallerySection';
import {
  formatHeroCeremonyDetails,
  resolveHeroGuestName,
} from '../utils/heroFormatters';

interface HeroSectionProps {
  config: WeddingConfig;
  guestName?: string;
  onScrollToRsvp?: () => void;
}

const HeroSwirlHeartLeft: React.FC = () => (
  <svg
    viewBox="0 0 64 26"
    fill="none"
    className="w-9 sm:w-12 h-4 sm:h-5 shrink-0 text-[#fffdf9] drop-shadow-[0_2px_2px_rgba(90,14,19,0.9)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]"
    aria-hidden="true"
  >
    <path
      d="M58 17C50 10 38 7 30 14C23 20 14 23 7 18C3 15 5 10 10 11C13 12 13 16 10 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M44 10C44 6.8 47.4 5.5 49.4 7.7C51.4 5.5 54.8 6.8 54.8 10C54.8 13.4 49.4 16.5 49.4 16.5C49.4 16.5 44 13.4 44 10Z"
      fill="#ffd4d8"
    />
  </svg>
);

const HeroSwirlHeartRight: React.FC = () => (
  <svg
    viewBox="0 0 64 26"
    fill="none"
    className="w-9 sm:w-12 h-4 sm:h-5 shrink-0 text-[#fffdf9] -scale-x-100 drop-shadow-[0_2px_2px_rgba(90,14,19,0.9)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]"
    aria-hidden="true"
  >
    <path
      d="M58 17C50 10 38 7 30 14C23 20 14 23 7 18C3 15 5 10 10 11C13 12 13 16 10 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M44 10C44 6.8 47.4 5.5 49.4 7.7C51.4 5.5 54.8 6.8 54.8 10C54.8 13.4 49.4 16.5 49.4 16.5C49.4 16.5 44 13.4 44 10Z"
      fill="#ffd4d8"
    />
  </svg>
);

const FloatingHeroHearts: React.FC = () => (
  <svg
    viewBox="0 0 36 28"
    fill="none"
    className="w-6 sm:w-7 h-5 sm:h-6 text-[#ff9aa4] inline-block align-middle ml-1.5 -mt-1.5 drop-shadow-[0_2px_2px_rgba(90,14,19,0.92)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]"
    aria-hidden="true"
  >
    <path
      d="M6 15.5C6 12.2 9.4 10.7 11.7 13C14 10.7 17.4 12.2 17.4 15.5C17.4 19.2 11.7 22.8 11.7 22.8C11.7 22.8 6 19.2 6 15.5Z"
      fill="currentColor"
    />
    <path
      d="M21 7.6C21 5.6 23.1 4.8 24.5 6.2C25.9 4.8 28 5.6 28 7.6C28 9.9 24.5 12.1 24.5 12.1C24.5 12.1 21 9.9 21 7.6Z"
      fill="#fff5f6"
      opacity="0.95"
    />
  </svg>
);

const BurgundyLaurelBranch: React.FC<{ mirrored?: boolean }> = ({ mirrored = false }) => (
  <svg
    viewBox="0 0 96 42"
    fill="none"
    className={`w-16 sm:w-20 h-8 shrink-0 text-[#721319]/80 ${mirrored ? '-scale-x-100' : ''}`}
    aria-hidden="true"
  >
    <path
      d="M90 36C66 35 42 26 12 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Upper & lower botanical leaves */}
    <path d="M22 14C19 7 13 6 9 9C12 14 17 15 22 14Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M35 20C32 12 26 11 22 14C25 19 30 21 35 20Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M49 26C47 18 41 16 36 19C39 24 44 26 49 26Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M64 31C63 23 57 21 52 24C55 29 59 31 64 31Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M78 34C77 27 72 25 67 28C70 32 74 34 78 34Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M28 19C20 19 16 23 16 28C22 27 26 24 28 19Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M42 25C34 25 30 29 30 34C36 33 40 30 42 25Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M57 30C49 30 45 34 45 38C51 37 55 34 57 30Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    <path d="M72 34C65 34 61 37 61 40C67 39 70 37 72 34Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
  </svg>
);

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  guestName,
}) => {
  const heroGroom = config.heroGroomName || HERO_GROOM_NAME;
  const heroBride = config.heroBrideName || HERO_BRIDE_NAME;
  const invitationGroom = config.invitationGroomName || INVITATION_GROOM_NAME;
  const invitationBride = config.invitationBrideName || INVITATION_BRIDE_NAME;
  const details = formatHeroCeremonyDetails(config);
  const displayGuest = resolveHeroGuestName(guestName);

  return (
    <section
      id="section-hero"
      className="relative w-full overflow-hidden select-none bg-white"
    >
      {/* 1 & 2. Full-Bleed Hero Photo Carousel with Absolute Raised-Lettering Header Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="relative z-10 w-full"
      >
        <PhotoGallerySection
          variant="hero"
          topOverlay={
            <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
              {/* Smooth atmospheric top scrim for crisp legibility on any photo */}
              <div className="absolute inset-x-0 top-0 h-52 sm:h-56 bg-gradient-to-b from-black/62 via-black/30 to-transparent" />

              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
                className="relative pt-6 sm:pt-7 pb-3 px-4 text-center"
              >
                {/* Flanking luminous swirls & hearts + "Thiệp Mời Cưới" */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 pr-4 sm:pr-0">
                  <HeroSwirlHeartLeft />
                  <p className="font-dancing text-[25px] sm:text-[30px] font-bold tracking-wide leading-none whitespace-nowrap hero-embossed-title">
                    Thiệp Mời Cưới
                  </p>
                  <HeroSwirlHeartRight />
                </div>

                {/* Staggered Couple Names with Tactile 3D Raised Lettering */}
                <div className="mt-2 max-w-[330px] sm:max-w-[360px] mx-auto">
                  <h1 className="font-dancing text-[35px] sm:text-[42px] font-bold leading-[1.12] text-left pl-3 sm:pl-5 hero-embossed-name">
                    <span>{heroGroom}</span>
                    <FloatingHeroHearts />
                  </h1>
                  <p className="font-dancing text-[35px] sm:text-[42px] font-bold leading-[1.12] text-right pr-3 sm:pr-5 -mt-1 hero-embossed-name">
                    {heroBride}
                  </p>
                </div>
              </motion.div>
            </div>
          }
        />
      </motion.div>

      {/* 3. Lower Formal Invitation Block (Clean White Stationery with Theme Burgundy Accents) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 px-5 pt-2 pb-7 text-center text-stone-800 bg-white"
      >
        {/* "Trân trọng kính mời: Quý khách" (or personalized guest name) */}
        <p className="font-dancing text-[26px] sm:text-[30px] font-semibold text-[#721319] leading-snug [text-wrap:balance]">
          <span>Trân trọng kính mời: </span>
          <span className="font-serif-editorial italic text-[22px] sm:text-[24px] font-semibold text-stone-900">
            {displayGuest}
          </span>
        </p>

        {/* Formal Ceremony Title */}
        <p className="mt-2.5 font-serif-editorial text-[16px] sm:text-[18px] font-semibold uppercase tracking-[0.06em] text-stone-800">
          TỚI DỰ TIỆC MỪNG LỄ THÀNH HÔN
        </p>

        {/* Two-Column Families: Nhà Trai & Nhà Gái */}
        <div className="mt-5 pt-4 pb-4 border-y border-[#721319]/12 max-w-[380px] mx-auto">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center">
            {/* Nhà Trai */}
            <div className="space-y-1">
              <h3 className="font-sans-clean font-bold text-base sm:text-lg text-[#721319] mb-1.5">
                Nhà Trai
              </h3>
              {config.groomFamily.father && (
                <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-800 leading-snug">
                  {config.groomFamily.father}
                </p>
              )}
              {config.groomFamily.mother && (
                <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-800 leading-snug">
                  {config.groomFamily.mother}
                </p>
              )}
              <p className="font-serif-editorial text-[14px] sm:text-[16px] text-stone-700 leading-snug">
                {config.groomFamily.address}
              </p>
            </div>

            {/* Nhà Gái */}
            <div className="space-y-1">
              <h3 className="font-sans-clean font-bold text-base sm:text-lg text-[#721319] mb-1.5">
                Nhà Gái
              </h3>
              {config.brideFamily.father && (
                <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-800 leading-snug">
                  {config.brideFamily.father}
                </p>
              )}
              {config.brideFamily.mother && (
                <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-800 leading-snug">
                  {config.brideFamily.mother}
                </p>
              )}
              <p className="font-serif-editorial text-[14px] sm:text-[16px] text-stone-700 leading-snug">
                {config.brideFamily.address}
              </p>
            </div>
          </div>

          {/* Large Calligraphy Groom & Bride Names */}
          <div className="space-y-0.5 mt-5">
            <h2 className="font-calligraphy text-[44px] sm:text-[52px] text-[#721319] leading-tight">
              {invitationGroom}
            </h2>
            <span className="block font-calligraphy text-[34px] sm:text-[40px] text-stone-700 leading-none py-0.5">
              &amp;
            </span>
            <h2 className="font-calligraphy text-[44px] sm:text-[52px] text-[#721319] leading-tight">
              {invitationBride}
            </h2>
          </div>
        </div>

        {/* Time: 11H00 */}
        <p className="mt-4 font-sans-clean text-[17px] sm:text-[19px] font-bold tracking-[0.08em] text-[#721319] tabular-nums">
          {details.timeLabel}
        </p>

        {/* Signature Date Emblem: CHỦ NHẬT | (( 20 )) | THÁNG 12 */}
        <div className="mt-2 flex items-center justify-center gap-3 sm:gap-4 max-w-[330px] mx-auto">
          {/* Weekday with double top/bottom lines */}
          <div className="flex-1 border-y border-[#721319]/75 py-[3px]">
            <div className="border-y border-[#721319]/28 py-1.5">
              <span className="block font-sans-clean text-[13px] sm:text-[14px] font-bold tracking-[0.06em] text-stone-800 whitespace-nowrap">
                {details.weekdayLabel}
              </span>
            </div>
          </div>

          {/* Double-ringed circular day badge */}
          <div className="w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] rounded-full border-2 border-[#721319] p-[3px] shrink-0 flex items-center justify-center bg-[#721319]/[0.03]">
            <div className="w-full h-full rounded-full border border-[#721319]/65 flex items-center justify-center">
              <span className="font-sans-clean text-[28px] sm:text-[32px] font-extrabold text-[#721319] leading-none tabular-nums">
                {details.dayLabel}
              </span>
            </div>
          </div>

          {/* Month with double top/bottom lines */}
          <div className="flex-1 border-y border-[#721319]/75 py-[3px]">
            <div className="border-y border-[#721319]/28 py-1.5">
              <span className="block font-sans-clean text-[13px] sm:text-[14px] font-bold tracking-[0.06em] text-stone-800 whitespace-nowrap">
                {details.monthLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Year: 2026 */}
        <p className="mt-1.5 font-sans-clean text-[18px] sm:text-[20px] font-bold tracking-[0.14em] text-stone-900 tabular-nums">
          {details.yearLabel}
        </p>

        {/* Venue & Address */}
        <div className="mt-2.5 space-y-1 px-2">
          <p className="font-dancing text-[22px] sm:text-[25px] font-semibold text-[#721319] leading-snug [text-wrap:balance]">
            {details.venueTitle}
          </p>
          {details.addressUpper && (
            <p className="font-sans-clean text-[12px] sm:text-[13px] font-bold tracking-[0.04em] text-stone-700 leading-relaxed max-w-[290px] sm:max-w-[320px] mx-auto [text-wrap:balance]">
              {details.addressUpper}
            </p>
          )}
        </div>

        {/* 4. Bottom Burgundy Laurel Branches + "Ngày chung đôi" Script */}
        <div className="mt-4 pt-1 flex items-end justify-center gap-1.5 sm:gap-2">
          <BurgundyLaurelBranch />
          <span className="font-dancing text-[28px] sm:text-[32px] font-semibold text-[#721319] leading-none tracking-wide pb-0.5 whitespace-nowrap">
            Ngày chung đôi
          </span>
          <BurgundyLaurelBranch mirrored />
        </div>
      </motion.div>
    </section>
  );
};
