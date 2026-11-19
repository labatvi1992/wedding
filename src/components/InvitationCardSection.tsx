import React from 'react';
import { motion } from 'framer-motion';
import { WeddingConfig } from '../types/wedding';

interface InvitationCardSectionProps {
  config: WeddingConfig;
  onScrollToRsvp?: () => void;
}

export const InvitationCardSection: React.FC<InvitationCardSectionProps> = ({ config }) => {
  const mapEmbedUrl =
    config.googleMapsEmbedUrl ||
    'https://maps.google.com/maps?q=73RP%2BHQG%20Nh%C3%A0%20h%C3%A0ng%20ti%E1%BB%87c%20c%C6%B0%E1%BB%9Bi%20Ng%E1%BB%8Dc%20B%C3%ADch%20Palace,%20B%C3%ACnh%20D%C6%B0%C6%A1ng,%20Gia%20Lai&t=&z=16&ie=UTF8&iwloc=&output=embed';
  const mapDirectUrl =
    config.googleMapsUrl || 'https://maps.app.goo.gl/dU7A8hXzqtGbRcP98?g_st=ic';

  return (
    <section id="section-invitation" className="w-full bg-white text-stone-900 pt-2 pb-2 select-none">
      <div className="px-4 sm:px-8 max-w-md mx-auto text-center">
        {/* Venue Map Heading & Anchor */}
        <motion.div
          id="section-map"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pt-2 pb-1 scroll-mt-16"
        >
          <h2 className="font-dancing text-[30px] sm:text-[34px] font-semibold text-[#721319] leading-tight">
            Địa điểm tổ chức
          </h2>
          <p className="font-serif-editorial text-base sm:text-lg text-stone-800 mt-1">
            Tại {config.venueName}
          </p>
        </motion.div>

        {/* Interactive Embedded Google Map */}
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

        <div className="mb-8">
          <a
            href={mapDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans-clean font-medium text-[#721319] hover:underline"
          >
            <span>Xem chỉ đường trên bản đồ</span>
          </a>
        </div>
      </div>
    </section>
  );
};
