import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, FileSpreadsheet, ExternalLink, UserCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, WeddingConfig } from '../types/wedding';

interface RsvpSectionProps {
  config: WeddingConfig;
  initialGuest?: Guest | null;
  onSaveRsvp: (guestData: Partial<Guest>, wishContent?: string) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ config, initialGuest, onSaveRsvp }) => {
  const [name, setName] = useState(initialGuest?.name || '');
  const [phone, setPhone] = useState(initialGuest?.phone || '');
  const [group, setFormGroup] = useState<Guest['group']>(initialGuest?.group || 'Bạn Chú rể');
  const [status, setStatus] = useState<'attending' | 'declined'>(initialGuest?.status === 'declined' ? 'declined' : 'attending');
  const [attendeesCount, setAttendeesCount] = useState<number>(initialGuest?.attendeesCount || 1);
  const [dietary, setDietary] = useState<string>(initialGuest?.dietaryPreference || 'standard');
  const [wish, setWish] = useState<string>(initialGuest?.wish || '');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialGuest) {
      setName(initialGuest.name);
      if (initialGuest.phone) setPhone(initialGuest.phone);
      if (initialGuest.group) setFormGroup(initialGuest.group);
      if (initialGuest.status) setStatus(initialGuest.status === 'declined' ? 'declined' : 'attending');
      if (initialGuest.attendeesCount) setAttendeesCount(initialGuest.attendeesCount);
      if (initialGuest.wish) setWish(initialGuest.wish);
    }
  }, [initialGuest]);

  const validate = () => {
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của quý khách.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleFireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#fb7185', '#fbbf24', '#10b981'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const rsvpData: Partial<Guest> = {
      name: name.trim(),
      phone: phone.trim(),
      group,
      status,
      attendeesCount: status === 'attending' ? attendeesCount : 0,
      dietaryPreference: dietary as 'standard' | 'vegetarian' | 'halal' | 'none',
      wish: wish.trim(),
    };

    // Save to application state & local store
    onSaveRsvp(rsvpData, wish.trim());

    // Send to Google Sheets if a Webhook / Apps Script endpoint is provided, or store synced record
    if (config.googleSheetUrl) {
      try {
        if (config.googleSheetUrl.includes('/exec')) {
          await fetch(config.googleSheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              name: name.trim(),
              phone: phone.trim(),
              group,
              status: status === 'attending' ? 'Tham gia' : 'Không tham gia',
              attendeesCount: status === 'attending' ? attendeesCount : 0,
              dietary,
              wish: wish.trim(),
            }),
          });
        }
      } catch {
        // Network fallback
      }
    }

    setIsSubmitting(false);
    setSubmitted(true);
    if (status === 'attending') {
      handleFireConfetti();
    }
  };

  return (
    <section id="rsvp-section" className="px-5 sm:px-8 lg:px-12 py-12 sm:py-16 bg-[#fbf9f6] text-stone-800 relative border-t border-stone-200/60">
      <div className="text-center space-y-1 mb-10 max-w-2xl mx-auto">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-rose-900 font-semibold">
          Xác Nhận Tham Dự
        </span>
        <h2 className="font-script text-4xl sm:text-5xl lg:text-6xl text-rose-950 font-semibold">
          Phản Hồi Thiệp Cưới
        </h2>
        <div className="w-12 h-0.5 bg-rose-800/40 mx-auto rounded-full my-3" />
        <p className="text-xs sm:text-sm text-stone-600 font-serif max-w-md mx-auto leading-relaxed">
          Thông tin phản hồi của quý khách sẽ được tự động tổng hợp trực tiếp vào <strong>Google Sheet</strong> của buổi lễ để gia đình sắp xếp đón tiếp chu đáo nhất.
        </p>
      </div>

      <div className="max-w-xl lg:max-w-2xl mx-auto">
        {submitted ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-stone-900">
              Cảm Ơn Quý Khách!
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-md mx-auto">
              Thông tin phản hồi của quý khách <strong className="text-rose-900 font-bold">{name}</strong> đã được ghi nhận và đồng bộ vào Google Sheet công khai của hôn lễ.
            </p>

            {status === 'attending' ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-950 max-w-md mx-auto">
                🎉 Rất vinh hạnh được đón tiếp bạn cùng gia đình ({attendeesCount} người) vào ngày <strong>16.11.2025</strong> tại <strong>{config.venueName}</strong>!
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Gia đình xin cảm ơn tấm lòng và lời chúc quý báu của quý khách. Hẹn gặp bạn trong dịp gần nhất!
              </div>
            )}

            {/* Direct Link to Google Sheet */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {config.googleSheetUrl && (
                <a
                  href={config.googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Xem Danh Sách Trên Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>
              )}

              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-stone-500 hover:text-stone-900 underline py-2 cursor-pointer"
              >
                Chỉnh sửa lại phản hồi
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-2xl space-y-5"
          >
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800">
                {errorMsg}
              </div>
            )}

            {/* Attendance Choice */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-2">
                Quý khách sẽ tham dự chứ? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('attending')}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === 'attending'
                      ? 'bg-rose-900 border-rose-900 text-white shadow-md'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  <span>Chắc chắn tham gia</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('declined')}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === 'declined'
                      ? 'bg-stone-700 border-stone-700 text-white shadow-md'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>Rất tiếc không thể đến</span>
                </button>
              </div>
            </div>

            {/* Responsive 2-column inputs on tablet/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Guest Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                  Họ và tên của quý khách *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Anh Hoàng Nam & Chị Mai"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-700 transition-colors"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại của bạn"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-700 transition-colors"
                />
              </div>
            </div>

            {/* Group / Relationship */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                Bạn là khách của:
              </label>
              <select
                value={group}
                onChange={(e) => setFormGroup(e.target.value as Guest['group'])}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-700 cursor-pointer"
              >
                <option value="Bạn Chú rể">Bạn Chú rể (Thanh Huy)</option>
                <option value="Bạn Cô dâu">Bạn Cô dâu (Phương Thúy)</option>
                <option value="Nhà trai">Họ hàng / Khách Nhà trai</option>
                <option value="Nhà gái">Họ hàng / Khách Nhà gái</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
              </select>
            </div>

            {status === 'attending' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Number of Attendees */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                    Số người tham dự (bạn & người đi cùng)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAttendeesCount(num)}
                        className={`w-10 h-10 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          attendeesCount === num
                            ? 'bg-rose-900 border-rose-900 text-white shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                    Khẩu vị ẩm thực
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-700 cursor-pointer"
                  >
                    <option value="standard">Tiệc tiêu chuẩn</option>
                    <option value="vegetarian">Ăn chay (Vegetarian)</option>
                    <option value="halal">Ăn kiêng / Halal</option>
                    <option value="none">Không có yêu cầu đặc biệt</option>
                  </select>
                </div>
              </div>
            )}

            {/* Wishes */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5">
                Lời chúc gửi tới Cô dâu & Chú rể
              </label>
              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                rows={3}
                placeholder="Gửi gắm lời chúc mừng hạnh phúc đến hai bạn..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-700 transition-colors"
              />
            </div>

            {/* Google Sheet Notice Card */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Phản hồi được ghi vào Google Sheet công khai</span>
              </div>
              {config.googleSheetUrl && (
                <a
                  href={config.googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1"
                >
                  <span>Xem bảng tính</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-900 via-[#6d1b22] to-rose-900 hover:from-rose-800 hover:to-rose-800 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xl hover:shadow-rose-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Đang gửi phản hồi...' : 'Xác Nhận Tham Dự & Gửi Đến Google Sheet'}</span>
            </button>

            <p className="text-[11px] text-stone-500 text-center font-sans">
              ⚡ Dữ liệu xác nhận của bạn sẽ được lưu tự động để gia đình chuẩn bị chỗ ngồi và cỗ tiệc chu đáo nhất.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
