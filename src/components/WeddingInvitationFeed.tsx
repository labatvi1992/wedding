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

  // Trigger balanced, romantic firework burst when scrolling across sections
  const triggerScrollFirework = React.useCallback((isBottomFinale = false) => {
    const weddingColors = ['#721319', '#e11d48', '#f43f5e', '#fbbf24', '#fda4af'];
    try {
      if (isBottomFinale) {
        // Double-side celebratory firework burst at the closing portrait
        confetti({
          particleCount: 24,
          angle: 60,
          spread: 55,
          origin: { x: 0.18, y: 0.72 },
          colors: weddingColors,
          ticks: 180,
          gravity: 0.8,
          scalar: 0.9,
        });
        confetti({
          particleCount: 24,
          angle: 120,
          spread: 55,
          origin: { x: 0.82, y: 0.72 },
          colors: weddingColors,
          ticks: 180,
          gravity: 0.8,
          scalar: 0.9,
        });
      } else {
        // Gentle alternating firework burst in the upper-middle viewport
        const randomX = 0.28 + Math.random() * 0.44;
        const randomY = 0.22 + Math.random() * 0.28;
        confetti({
          particleCount: 18,
          spread: 68,
          startVelocity: 24,
          origin: { x: randomX, y: randomY },
          colors: weddingColors,
          ticks: 150,
          gravity: 0.75,
          scalar: 0.85,
        });
      }
    } catch {
      // Ignore if canvas-confetti fails in restricted environments
    }
  }, []);

  // Scroll listener to flip down arrow to up arrow at bottom & fire scroll fireworks
  React.useEffect(() => {
    let lastFireworkScrollY = window.scrollY;
    let lastFireworkTime = 0;
    let wasAtBottom = false;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrolledToBottom =
        window.innerHeight + currentY >= document.documentElement.scrollHeight - 220;
      setAtBottom(scrolledToBottom);

      const now = Date.now();
      const scrollDelta = Math.abs(currentY - lastFireworkScrollY);

      if (scrolledToBottom && !wasAtBottom && now - lastFireworkTime > 700) {
        lastFireworkScrollY = currentY;
        lastFireworkTime = now;
        triggerScrollFirework(true);
      } else if (scrollDelta >= 360 && now - lastFireworkTime >= 950) {
        lastFireworkScrollY = currentY;
        lastFireworkTime = now;
        triggerScrollFirework(false);
      }

      wasAtBottom = scrolledToBottom;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerScrollFirework]);

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
    showToast(`Đã gửi lời chúc hạnh phúc tới ${config.brideName} & ${config.groomName}!`);
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
                  <span>Xác nhận tham dự</span>
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
                  <span>Địa điểm &amp; Bản đồ tiệc cưới</span>
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
                    <span>Quản lý khách mời &amp; Bảng tính</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Bar */}
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

            {/* 2. "Xác nhận tham dự" Rounded Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSheet('rsvp')}
              className="flex-1 h-9 px-4 rounded-full bg-[#721319] hover:bg-[#5e1015] text-white text-xs sm:text-[13px] font-sans-clean font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Xác nhận tham dự</span>
            </motion.button>

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

        {/* Bottom Sheet Modal for Xác Nhận Tham Dự */}
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
                {/* Sheet Header */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#721319] text-white">
                      Xác Nhận Tham Dự
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveSheet('none')}
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {rsvpSubmitted ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif-editorial text-2xl font-bold text-stone-900">
                      Cảm Ơn {guestName}!
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                      Phản hồi của bạn đã được lưu và đồng bộ vào danh sách của{' '}
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
                          <span>Xem Bảng Danh Sách</span>
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

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#721319] hover:bg-[#5a0e13] text-white font-semibold text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
                    >
                      Gửi Xác Nhận Tham Dự
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
