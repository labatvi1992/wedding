import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import { DEMO_IMAGES } from '../data/initialData';

interface InvitationCardSectionProps {
  config: WeddingConfig;
  onScrollToRsvp?: () => void;
}

export const InvitationCardSection: React.FC<InvitationCardSectionProps> = ({ config }) => {
  const mapEmbedUrl =
    config.googleMapsEmbedUrl ||
    'https://maps.google.com/maps?q=C%E1%BA%A7u%20B%E1%BA%BFn%20Sung,%20Nh%C6%B0%20Thanh,%20Thanh%20H%C3%B3a&t=&z=15&ie=UTF8&iwloc=&output=embed';

  return (
    <section id="section-invitation" className="w-full bg-white text-stone-900 pt-4 pb-2 select-none">
      <div className="px-4 sm:px-8 max-w-md mx-auto text-center">
        {/* 1. Two-Column Families: Nhà Trai & Nhà Gái */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="grid grid-cols-2 gap-4 sm:gap-6 mb-10 text-center"
        >
          {/* Nhà Trai */}
          <div className="space-y-1.5">
            <h3 className="font-sans-clean font-bold text-lg sm:text-xl text-stone-900 mb-2">
              Nhà Trai
            </h3>
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
              {config.groomFamily.father}
            </p>
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
              {config.groomFamily.mother}
            </p>
            <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-700 leading-snug">
              {config.groomFamily.address}
            </p>
          </div>

          {/* Nhà Gái */}
          <div className="space-y-1.5">
            <h3 className="font-sans-clean font-bold text-lg sm:text-xl text-stone-900 mb-2">
              Nhà Gái
            </h3>
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
              {config.brideFamily.father}
            </p>
            <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
              {config.brideFamily.mother}
            </p>
            <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-700 leading-snug">
              {config.brideFamily.address}
            </p>
          </div>
        </motion.div>

        {/* 2. Large Calligraphy Names: Quỳnh Hương & Minh Anh */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="space-y-1 my-6"
        >
          <h2 className="font-calligraphy text-[48px] sm:text-[58px] text-stone-900 leading-tight">
            {config.brideName}
          </h2>
          <span className="block font-calligraphy text-[38px] sm:text-[44px] text-stone-800 leading-none py-1">
            &amp;
          </span>
          <h2 className="font-calligraphy text-[48px] sm:text-[58px] text-stone-900 leading-tight">
            {config.groomName}
          </h2>
        </motion.div>

        {/* 3. Formal Ceremony Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.1, ease: 'easeOut' }}
          className="mt-8 space-y-3"
        >
          <p className="font-serif-editorial text-xl sm:text-2xl tracking-[0.06em] uppercase text-stone-900">
            TIỆC MỪNG LỄ THÀNH HÔN
          </p>
          <p className="font-serif-editorial text-base sm:text-lg tracking-[0.05em] uppercase text-stone-800">
            VÀO LÚC {config.weddingTime || '11:00'} CHỦ NHẬT
          </p>

          {/* THÁNG 10 | 22 | NĂM 2027 */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
            <div className="flex-1 text-right border-t border-b border-stone-300 py-1.5">
              <span className="font-serif-editorial text-lg sm:text-xl tracking-wider uppercase text-stone-800">
                {config.ceremonyMonth || 'THÁNG 10'}
              </span>
            </div>

            <span className="font-serif-editorial text-6xl sm:text-7xl font-bold text-[#721319] leading-none px-1">
              {config.ceremonyDay || 22}
            </span>

            <div className="flex-1 text-left border-t border-b border-stone-300 py-1.5">
              <span className="font-serif-editorial text-lg sm:text-xl tracking-wider uppercase text-stone-800">
                {config.ceremonyYear || 'NĂM 2027'}
              </span>
            </div>
          </div>

          <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-700 pt-1">
            {config.lunarDate || '(Tức ngày 09 tháng 08 năm Đinh Mùi)'}
          </p>

          <p className="font-serif-editorial text-lg sm:text-xl text-stone-800 pt-3 pb-2">
            Tại {config.venueName.toLowerCase().startsWith('khách sạn') ? config.venueName : `khách sạn ${config.venueName}`}
          </p>
        </motion.div>

        {/* 4. Interactive Embedded Google Map matching video (0:34 - 0:37) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75 }}
          className="mt-4 mb-6 rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 h-56 sm:h-64 w-full relative"
        >
          <iframe
            title={`Bản đồ ${config.venueName}`}
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>

      {/* 5. Full-Width Mid-Page Studio Celebration Photo (0:37 - 0:40) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="w-full aspect-[3/3.6] overflow-hidden bg-stone-900 mt-4"
      >
        <img
          src={DEMO_IMAGES.coupleCelebration}
          alt={`${config.brideName} & ${config.groomName} celebration`}
          className="w-full h-full object-fill"
        />
      </motion.div>
    </section>
  );
};
