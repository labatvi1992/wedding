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
import { InvitationCardSection } from './InvitationCardSection';
import { WeddingClosingSection } from './WeddingTimelineSection';
import {
  buildSheetRowPayload,
  resolveGoogleSheetWebhookUrl,
  submitRowToGoogleSheet,
  SheetRowPayload,
} from '../utils/googleSheetSync';

interface WeddingInvitationFeedProps {
  config: WeddingConfig;
  guests?: Guest[];
  currentGuest: Guest | null;
  wishes: GuestWish[];
  onSaveRsvp: (guestData: Partial<Guest>, wishContent?: string) => void;
  onAddWish: (wish: GuestWish) => void;
  onOpenManagement: () => void;
}

export const WeddingInvitationFeed: React.FC<WeddingInvitationFeedProps> = ({
  config,
  guests = [],
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

  // RSVP Modal State (auto-synced when currentGuest is resolved from URL)
  const [guestName, setGuestName] = useState(currentGuest?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentGuest?.phone || '');
  const [guestGroup, setGuestGroup] = useState<Guest['group']>(currentGuest?.group || 'Bạn Chú rể');
  const [attendanceStatus, setAttendanceStatus] = useState<'attending' | 'declined'>(
    currentGuest?.status === 'declined' ? 'declined' : 'attending'
  );
  const [attendeesCount, setAttendeesCount] = useState<number>(currentGuest?.attendeesCount || 1);
  const [rsvpWish, setRsvpWish] = useState<string>(currentGuest?.wish || '');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [lastSubmittedRow, setLastSubmittedRow] = useState<SheetRowPayload | null>(null);

  React.useEffect(() => {
    if (currentGuest?.name) {
      setGuestName(currentGuest.name);
    }
    if (currentGuest?.phone) {
      setGuestPhone(currentGuest.phone);
    }
  }, [currentGuest]);

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
    showToast(`Đã gửi lời chúc hạnh phúc tới ${config.groomName} & ${config.brideName}!`);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || isSubmittingRsvp) return;

    setRsvpError(null);
    const webhookUrl = resolveGoogleSheetWebhookUrl(config);
    if (!webhookUrl) {
      setRsvpError(
        'Chưa cấu hình biến môi trường GOOGLE_SHEET_WEB_APP_URL nên không thể lưu vào Google Sheet.'
      );
      return;
    }

    setIsSubmittingRsvp(true);

    // Calculate auto-incremented STT based on existing confirmed guests
    const confirmedCount = guests.filter(
      (g) => g.status === 'attending' || g.status === 'declined'
    ).length;
    const nextStt = confirmedCount + 1;

    const rowPayload = buildSheetRowPayload({
      stt: nextStt,
      name: guestName.trim(),
      status: attendanceStatus,
      attendeesCount: attendanceStatus === 'attending' ? attendeesCount : 0,
    });

    const ok = await submitRowToGoogleSheet(webhookUrl, rowPayload);
    setIsSubmittingRsvp(false);

    if (!ok) {
      setRsvpError('Không thể kết nối tới Google Sheet. Vui lòng kiểm tra lại GOOGLE_SHEET_WEB_APP_URL.');
      return;
    }

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

    setLastSubmittedRow(rowPayload);
    setRsvpSubmitted(true);
    handleHeartReaction();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Thiệp Cưới: ${config.groomName} & ${config.brideName}`,
          text: `Trân trọng kính mời bạn tham dự Lễ Thành Hôn của ${config.groomName} & ${config.brideName}.`,
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
              className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-full bg-[#721319] text-white text-xs font-medium shadow-lg whitespace-nowrap"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Hero Save The Date Section */}
        <HeroSection config={config} guestName={currentGuest?.name} />

        {/* 2. October Calendar + Bride Card + Vertical Countdown + Groom Card */}
        <CoupleCalendarCountdownSection config={config} />

        {/* 3. Embedded Venue Map */}
        <InvitationCardSection
          config={config}
          onScrollToRsvp={() => setActiveSheet('rsvp')}
        />

        {/* 5. Closing RSVP Note + Closing Portrait */}
        <WeddingClosingSection
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
              className="flex-1 h-9 px-2.5 sm:px-3.5 rounded-full bg-[#721319] hover:bg-[#5e1015] text-white text-[11.5px] sm:text-[13px] font-sans-clean font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Xác nhận tham dự</span>
            </motion.button>

            {/* 3. "Địa điểm nhà hàng" Button (Replaces Menu Button) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => scrollToSection('section-map')}
              aria-label="Địa điểm nhà hàng"
              className="h-9 px-2.5 sm:px-3.5 rounded-full bg-stone-700/90 hover:bg-stone-800 text-white text-[11.5px] sm:text-[13px] font-sans-clean font-medium flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Địa điểm nhà hàng</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Sheet Modal for Xác Nhận Tham Dự */}
        <AnimatePresence>
          {activeSheet !== 'none' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
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
                  <div className="py-5 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif-editorial text-2xl font-bold text-stone-900">
                      Cảm Ơn {guestName}!
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                      Thông tin xác nhận của bạn đã được ghi nhận vào{' '}
                      <strong>Danh sách mời cưới</strong> của{' '}
                      <strong>{config.groomName} &amp; {config.brideName}</strong>.
                    </p>

                    {lastSubmittedRow && (
                      <div className="mx-auto max-w-sm rounded-2xl border border-stone-200 bg-stone-50/90 overflow-hidden text-xs">
                        <div className="grid grid-cols-12 bg-stone-100 border-b border-stone-200 py-2 px-3 font-semibold text-stone-600 text-left">
                          <div className="col-span-2">STT</div>
                          <div className="col-span-5">Họ tên</div>
                          <div className="col-span-3">Xác nhận</div>
                          <div className="col-span-2 text-right">Số lượng</div>
                        </div>
                        <div className="grid grid-cols-12 py-2.5 px-3 text-stone-800 items-center text-left">
                          <div className="col-span-2 font-mono font-semibold text-[#721319]">
                            {lastSubmittedRow.STT}
                          </div>
                          <div className="col-span-5 font-medium truncate pr-1">
                            {lastSubmittedRow['Họ tên']}
                          </div>
                          <div className="col-span-3 text-[11px] font-semibold text-emerald-700">
                            {lastSubmittedRow.Vote}
                          </div>
                          <div className="col-span-2 text-right font-mono font-bold">
                            {lastSubmittedRow['Số lượng']}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
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
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Họ và tên của bạn *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Nhập họ và tên của bạn..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#721319]"
                      />
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

                    {rsvpError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                        {rsvpError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingRsvp}
                      className="w-full py-3 rounded-xl bg-[#721319] hover:bg-[#5a0e13] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
                    >
                      {isSubmittingRsvp ? 'Đang gửi xác nhận...' : 'Gửi Xác Nhận Tham Dự'}
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
