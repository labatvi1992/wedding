import React, { useState } from 'react';
import { MapPin, QrCode, Navigation, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface RestaurantMapQrSectionProps {
  config: WeddingConfig;
}

export const RestaurantMapQrSection: React.FC<RestaurantMapQrSectionProps> = ({ config }) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${config.venueName}, ${config.venueHall}, ${config.venueAddress}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // Google Maps direct location URL
  const targetMapUrl = config.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${config.venueName} ${config.venueAddress}`)}`;

  // Public QR Code Generator URL for the Maps Link
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(targetMapUrl)}`;

  return (
    <section className="px-5 sm:px-8 lg:px-12 py-12 sm:py-16 bg-[#f8f5ef] text-stone-800 relative border-t border-stone-200/60">
      <div className="text-center space-y-1 mb-10 max-w-2xl mx-auto">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-rose-900 font-semibold">
          Chỉ Đường Trực Tiếp
        </span>
        <h2 className="font-script text-4xl sm:text-5xl lg:text-6xl text-rose-950 font-semibold">
          QR Vị Trí Nhà Hàng
        </h2>
        <div className="w-12 h-0.5 bg-rose-800/40 mx-auto rounded-full my-3" />
        <p className="text-xs sm:text-sm text-stone-600 font-serif max-w-md mx-auto leading-relaxed">
          Quý khách có thể quét mã QR bên dưới bằng camera điện thoại hoặc Zalo để mở chỉ đường Google Maps trực tiếp đến sảnh tiệc cưới:
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left / Center QR Code Card */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xl text-center space-y-4 w-full max-w-[320px]">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5 text-rose-800" />
              <span>Quét Mã Để Chỉ Đường</span>
            </div>

            {/* QR Code Frame */}
            <div className="mx-auto w-48 h-48 sm:w-52 sm:h-52 p-3 rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden flex items-center justify-center relative">
              <img
                src={qrImageUrl}
                alt={`Mã QR địa chỉ ${config.venueName}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-stone-800 p-2">
                      <svg class="w-12 h-12 text-rose-800 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span class="text-xs font-bold">Mã QR Google Maps</span>
                      <span class="text-[10px] text-stone-500">Chỉ đường nhà hàng</span>
                    </div>
                  `;
                }}
              />
            </div>

            <p className="text-[11px] text-stone-500 font-sans">
              Chạm hoặc quét mã bằng điện thoại để xem tuyến đường thuận tiện nhất.
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="md:col-span-7 space-y-5 text-center md:text-left">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-semibold border border-rose-200">
              ★ ĐỊA ĐIỂM TỔ CHỨC
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-950 leading-tight">
              {config.venueName}
            </h3>
            <p className="text-sm sm:text-base font-serif text-amber-900 font-medium">
              {config.venueHall}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-start gap-2.5 text-stone-700 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-sans">{config.venueAddress}</span>
            </div>
            
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyAddress}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Sao chép địa chỉ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={targetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 hover:from-rose-800 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg hover:shadow-rose-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>Mở Google Maps Chỉ Đường</span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-300" />
            </a>
          </div>

          <p className="text-[11px] text-stone-500 italic font-serif">
            * Trung tâm có bãi đỗ xe ô tô và xe máy rộng rãi ngay phía trước sảnh đón.
          </p>
        </div>
      </div>
    </section>
  );
};
