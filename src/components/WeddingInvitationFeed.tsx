import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Menu,
  X,
  Send,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, GuestWish, WeddingConfig } from '../types/wedding';
import { AudioDiscButton } from './AudioDiscButton';
import { HeroSection } from './HeroSection';
import { CoupleCalendarCountdownSection } from './CoupleCalendarCountdownSection';
import { LoveStorySection } from './LoveStorySection';
import { InvitationCardSection } from './InvitationCardSection';
import { WeddingTimelineSection } from './WeddingTimelineSection';

interface WeddingInvitationFeedProps {
  config: WeddingConfig;
  currentGuest: Guest | null;
  wishes: GuestWish[];
  onSaveRsvp: (guestData: Partial<Guest>, wishContent?: string) => void;
  onAddWish: (wish: GuestWish) => void;
  onOpenManagement: () => void;
}

export const WeddingInvitationFeed: React.FC<WeddingInvitationFeedProps> = ({
  config,
  currentGuest,
  wishes,
  onSaveRsvp,
  onAddWish,
  onOpenManagement,
}) => {
  const [quickWishText, setQuickWishText] = useState('');
  const [heartCount, setHeartCount] = useState(128);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'none' | 'rsvp' | 'wishes'>('none');
  const [atBottom, setAtBottom] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // RSVP Modal State
  const [guestName, setGuestName] = useState(currentGuest?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentGuest?.phone || '');
  const [guestGroup, setGuestGroup] = useState<Guest['group']>(currentGuest?.group || 'Bạn Chú rể');
  const [attendanceStatus, setAttendanceStatus] = useState<'attending' | 'declined'>(
    currentGuest?.status === 'declined' ? 'declined' : 'attending'
  );
  const [attendeesCount, setAttendeesCount] = useState<number>(currentGuest?.attendeesCount || 1);
  const [rsvpWish, setRsvpWish] = useState<string>(currentGuest?.wish || '');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  // Scroll listener to flip down arrow to up arrow at bottom
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 220;
      setAtBottom(scrolledToBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll next section or back to top
  const handleScrollAction = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.78, behavior: 'smooth' });
    }
  };

  // Trigger floating hearts & confetti
  const handleHeartReaction = () => {
    setHeartCount((prev) => prev + 1);
    const id = Date.now() + Math.random();
    const randomX = Math.floor(Math.random() * 50) - 25;
    setFloatingHearts((prev) => [...prev.slice(-8), { id, x: randomX }]);

    try {
      confetti({
        particleCount: 22,
        spread: 50,
        origin: { x: 0.78, y: 0.92 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#721319'],
      });
    } catch {
      // Fallback
    }
  };

  // Handle quick wish submit from the bottom input bar ("Gửi lời chúc...")
  const handleQuickWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickWishText.trim();
    if (!trimmed) {
      setActiveSheet('wishes');
      return;
    }

    const authorName = currentGuest?.name || guestName.trim() || 'Khách mời thân thiết';
    const newWish: GuestWish = {
      id: `w-${Date.now()}`,
      author: authorName,
      relationship: currentGuest?.relationship || 'Bạn hai bên gia đình',
      content: trimmed,
      createdAt: 'Vừa xong',
    };

    onAddWish(newWish);
    setQuickWishText('');
    handleHeartReaction();
    showToast('Đã gửi lời chúc hạnh phúc tới Quỳnh Hương & Minh Anh!');
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    onSaveRsvp(
      {
        name: guestName.trim(),
        phone: guestPhone.trim(),
        group: guestGroup,
        status: attendanceStatus,
        attendeesCount: attendanceStatus === 'attending' ? attendeesCount : 0,
        wish: rsvpWish.trim(),
      },
      rsvpWish.trim()
    );

    if (config.googleSheetUrl && config.googleSheetUrl.includes('/exec')) {
      try {
        await fetch(config.googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            name: guestName.trim(),
            phone: guestPhone.trim(),
            group: guestGroup,
            status: attendanceStatus === 'attending' ? 'Tham gia' : 'Không tham gia',
            attendeesCount: attendanceStatus === 'attending' ? attendeesCount : 0,
            wish: rsvpWish.trim(),
          }),
        });
      } catch {
        // Ignore network error
      }
    }

    setRsvpSubmitted(true);
    handleHeartReaction();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Thiệp Cưới: ${config.brideName} & ${config.groomName}`,
          text: `Trân trọng kính mời bạn tham dự Lễ Thành Hôn của ${config.brideName} & ${config.groomName}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      showToast('Đã sao chép đường dẫn thiệp cưới!');
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-200/70 flex flex-col items-center justify-start relative">
      {/* Centered Mobile-First Card Feed Container matching Demo Video */}
      <div className="w-full max-w-[460px] bg-white shadow-[0_0_50px_rgba(0,0,0,0.12)] min-h-screen relative pb-16 overflow-x-hidden">
        {/* Top-Right Sticky Audio Equalizer Button matching video */}
        <div className="fixed top-3.5 right-3.5 sm:right-[calc(50%-216px)] z-40">
          <AudioDiscButton />
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#721319] text-white text-xs font-medium shadow-lg whitespace-nowrap"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Hero Save The Date Section */}
        <HeroSection config={config} guestName={currentGuest?.name} />

        {/* 2. October Calendar + Bride Card + Vertical Countdown + Groom Card */}
        <CoupleCalendarCountdownSection config={config} />

        {/* 3. Tilted Spiral Notebook Cards: OUR LOVE STORY */}
        <LoveStorySection />

        {/* 4. Formal Invitation + Embedded Google Map + Celebration Portrait */}
        <InvitationCardSection
          config={config}
          onScrollToRsvp={() => setActiveSheet('rsvp')}
        />

        {/* 5. Vertical Numbered Timeline + RSVP Note + Closing "forever" Red Curtain Portrait */}
        <WeddingTimelineSection
          config={config}
          onOpenRsvpModal={() => setActiveSheet('rsvp')}
        />

        {/* Floating Hearts Animation Layer */}
        <div className="fixed bottom-16 right-14 sm:right-[calc(50%-175px)] pointer-events-none z-40">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 0, x: h.x, scale: 0.7 }}
                animate={{ opacity: 0, y: -130, x: h.x * 1.5, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute bottom-0 right-0 text-rose-500"
              >
                <Heart className="w-5 h-5 fill-rose-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Menu Popover above the Hamburger button */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-16 right-3 sm:right-[calc(50%-218px)] z-50 w-60 rounded-2xl bg-white shadow-2xl border border-stone-200/90 p-2 text-stone-800 space-y-1"
              >
                <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
                  <span className="font-serif-editorial font-semibold text-sm text-[#721319]">
                    {config.brideName} &amp; {config.groomName}
                  </span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveSheet('rsvp');
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-left text-xs font-medium flex items-center gap-2.5 text-[#721319] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Xác nhận tham dự (RSVP)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveSheet('wishes');
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-stone-100 text-left text-xs font-medium flex items-center justify-between text-stone-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Xem lời chúc ({wishes.length})</span>
                  </div>
                  <span className="text-[10px] text-stone-400">{heartCount} ♥</span>
                </button>

                <button
                  onClick={() => scrollToSection('section-calendar')}
                  className="w-full px-3 py-2 rounded-xl hover:bg-stone-100 text-left text-xs font-medium flex items-center gap-2.5 text-stone-700 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>Lịch cưới &amp; Đếm ngược</span>
                </button>

                <button
                  onClick={() => scrollToSection('section-invitation')}
                  className="w-full px-3 py-2 rounded-xl hover:bg-stone-100 text-left text-xs font-medium flex items-center gap-2.5 text-stone-700 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>Địa điểm &amp; Bản đồ Miwedi</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-stone-100 text-left text-xs font-medium flex items-center gap-2.5 text-stone-700 cursor-pointer"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Share2 className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                  <span>Chia sẻ thiệp cưới</span>
                </button>

                <div className="pt-1 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenManagement();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-stone-100 text-left text-xs font-medium flex items-center gap-2.5 text-stone-600 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Quản lý khách mời &amp; Google Sheet</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Bar matching video (0:00 - 0:50) */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 px-3 py-2 bg-gradient-to-t from-white/95 via-white/85 to-transparent backdrop-blur-[2px]">
          <div className="flex items-center gap-2">
            {/* 1. Down/Up Scroll Circle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleScrollAction}
              aria-label={atBottom ? 'Cuộn lên đầu trang' : 'Cuộn xuống tiếp'}
              className="w-9 h-9 rounded-full bg-stone-400/80 hover:bg-stone-500/85 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              {atBottom ? (
                <ChevronUp className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <ChevronDown className="w-5 h-5 stroke-[2.2]" />
              )}
            </motion.button>

            {/* 2. "Gửi lời chúc..." Rounded Input Bar */}
            <form onSubmit={handleQuickWishSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                value={quickWishText}
                onChange={(e) => setQuickWishText(e.target.value)}
                placeholder="Gửi lời chúc..."
                className="w-full h-9 pl-4 pr-9 rounded-full bg-stone-400/75 hover:bg-stone-400/85 focus:bg-stone-500/90 text-white placeholder:text-white/95 text-xs sm:text-[13px] font-sans-clean focus:outline-none transition-colors shadow-xs"
              />
              {quickWishText.trim() ? (
                <button
                  type="submit"
                  aria-label="Gửi lời chúc"
                  className="absolute right-2 p-1 text-white hover:text-amber-200 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSheet('rsvp')}
                  title="Mở bảng xác nhận tham dự & lời chúc"
                  className="absolute right-2.5 text-[10px] text-white/85 hover:text-white font-medium cursor-pointer"
                >
                  RSVP
                </button>
              )}
            </form>

            {/* 3. Heart Reaction Circle Button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleHeartReaction}
              aria-label="Thả tim chúc mừng"
              className="w-9 h-9 rounded-full bg-stone-400/80 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              <Heart className="w-4 h-4 stroke-[2.2]" />
            </motion.button>

            {/* 4. Dark Red Hamburger Menu Circle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Mở menu tiện ích"
              className="w-9 h-9 rounded-full bg-[#801b22] hover:bg-[#641217] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-colors"
            >
              <Menu className="w-4 h-4 stroke-[2.4]" />
            </motion.button>
          </div>
        </div>

        {/* Bottom Sheet Modal for RSVP & Wishes */}
        <AnimatePresence>
          {activeSheet !== 'none' && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSheet('none')}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                className="relative z-10 w-full max-w-[460px] bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
              >
                {/* Sheet Tabs Header */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSheet('rsvp')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        activeSheet === 'rsvp'
                          ? 'bg-[#721319] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Xác Nhận Tham Dự (RSVP)
                    </button>
                    <button
                      onClick={() => setActiveSheet('wishes')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        activeSheet === 'wishes'
                          ? 'bg-[#721319] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Lời Chúc ({wishes.length})
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveSheet('none')}
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeSheet === 'rsvp' ? (
                  rsvpSubmitted ? (
                    <div className="py-6 text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-serif-editorial text-2xl font-bold text-stone-900">
                        Cảm Ơn {guestName}!
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                        Phản hồi của bạn đã được lưu và đồng bộ vào danh sách Google Sheet của{' '}
                        <strong>{config.brideName} &amp; {config.groomName}</strong>.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                        {config.googleSheetUrl && (
                          <a
                            href={config.googleSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Xem Google Sheet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => setRsvpSubmitted(false)}
                          className="text-xs text-stone-500 underline py-1.5 cursor-pointer"
                        >
                          Chỉnh sửa lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Họ và tên của bạn *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Nhập tên của bạn..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#721319]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="Số điện thoại..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#721319]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Khách của
                          </label>
                          <select
                            value={guestGroup}
                            onChange={(e) => setGuestGroup(e.target.value as Guest['group'])}
                            className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-[#721319]"
                          >
                            <option value="Nhà gái">Khách Nhà Gái</option>
                            <option value="Nhà trai">Khách Nhà Trai</option>
                            <option value="Bạn Cô dâu">Bạn Cô Dâu</option>
                            <option value="Bạn Chú rể">Bạn Chú Rể</option>
                            <option value="Đồng nghiệp">Đồng Nghiệp</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setAttendanceStatus('attending')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                            attendanceStatus === 'attending'
                              ? 'bg-[#721319] border-[#721319] text-white'
                              : 'bg-stone-50 border-stone-200 text-stone-600'
                          }`}
                        >
                          Sẽ tham dự
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceStatus('declined')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                            attendanceStatus === 'declined'
                              ? 'bg-stone-700 border-stone-700 text-white'
                              : 'bg-stone-50 border-stone-200 text-stone-600'
                          }`}
                        >
                          Bận không tới được
                        </button>
                      </div>

                      {attendanceStatus === 'attending' && (
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Số người tham dự
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setAttendeesCount(n)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold border cursor-pointer ${
                                  attendeesCount === n
                                    ? 'bg-[#721319] border-[#721319] text-white'
                                    : 'bg-stone-50 border-stone-200 text-stone-700'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Lời chúc gửi cô dâu &amp; chú rể
                        </label>
                        <textarea
                          rows={2}
                          value={rsvpWish}
                          onChange={(e) => setRsvpWish(e.target.value)}
                          placeholder="Gửi lời chúc tốt đẹp nhất..."
                          className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#721319]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#721319] hover:bg-[#5a0e13] text-white font-semibold text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
                      >
                        Gửi Xác Nhận Tham Dự
                      </button>
                    </form>
                  )
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {wishes.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs sm:text-sm text-[#721319]">
                            {w.author}
                          </span>
                          <span className="text-[10px] text-stone-400">{w.createdAt}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif-editorial">
                          &ldquo;{w.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
