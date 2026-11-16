import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';
import {
  INVITATION_GROOM_NAME,
  INVITATION_BRIDE_NAME,
} from '../data/initialData';
import { PhotoGallerySection } from './PhotoGallerySection';

interface InvitationCardSectionProps {
  config: WeddingConfig;
  onScrollToRsvp?: () => void;
}

export const InvitationCardSection: React.FC<InvitationCardSectionProps> = ({ config }) => {
  const invitationGroom = config.invitationGroomName || INVITATION_GROOM_NAME;
  const invitationBride = config.invitationBrideName || INVITATION_BRIDE_NAME;
  const mapEmbedUrl =
    config.googleMapsEmbedUrl ||
    'https://maps.google.com/maps?q=73RP%2BHQG%20Nh%C3%A0%20h%C3%A0ng%20ti%E1%BB%87c%20c%C6%B0%E1%BB%9Bi%20Ng%E1%BB%8Dc%20B%C3%ADch%20Palace,%20B%C3%ACnh%20D%C6%B0%C6%A1ng,%20Gia%20Lai&t=&z=16&ie=UTF8&iwloc=&output=embed';
  const mapDirectUrl =
    config.googleMapsUrl || 'https://maps.app.goo.gl/dU7A8hXzqtGbRcP98?g_st=ic';

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
            {config.groomFamily.father && (
              <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
                {config.groomFamily.father}
              </p>
            )}
            {config.groomFamily.mother && (
              <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
                {config.groomFamily.mother}
              </p>
            )}
            <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-700 leading-snug">
              {config.groomFamily.address}
            </p>
          </div>

          {/* Nhà Gái */}
          <div className="space-y-1.5">
            <h3 className="font-sans-clean font-bold text-lg sm:text-xl text-stone-900 mb-2">
              Nhà Gái
            </h3>
            {config.brideFamily.father && (
              <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
                {config.brideFamily.father}
              </p>
            )}
            {config.brideFamily.mother && (
              <p className="font-serif-editorial text-[16px] sm:text-[18px] text-stone-800 leading-snug">
                {config.brideFamily.mother}
              </p>
            )}
            <p className="font-serif-editorial text-[15px] sm:text-[17px] text-stone-700 leading-snug">
              {config.brideFamily.address}
            </p>
          </div>
        </motion.div>

        {/* 2. Large Calligraphy Names */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="space-y-1 my-6"
        >
          <h2 className="font-calligraphy text-[48px] sm:text-[58px] text-stone-900 leading-tight">
            {invitationGroom}
          </h2>
          <span className="block font-calligraphy text-[38px] sm:text-[44px] text-stone-800 leading-none py-1">
            &amp;
          </span>
          <h2 className="font-calligraphy text-[48px] sm:text-[58px] text-stone-900 leading-tight">
            {invitationBride}
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

          <p id="section-map" className="font-serif-editorial text-lg sm:text-xl text-stone-800 pt-3 pb-2 scroll-mt-16">
            Tại {config.venueName}
          </p>
        </motion.div>

        {/* 4. Interactive Embedded Google Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75 }}
          className="mt-4 mb-3 rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 h-56 sm:h-64 w-full relative"
        >
          <iframe
            title={`Bản đồ ${config.venueName}`}
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        <div className="mb-6">
          <a
            href={mapDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans-clean font-medium text-[#721319] hover:underline"
          >
            <span>Xem chỉ đường trên Google Maps</span>
          </a>
        </div>
      </div>

      {/* 5. 3D Coverflow Photo Carousel below Google Maps */}
      <PhotoGallerySection />
    </section>
  );
};
