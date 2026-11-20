import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  ArrowLeft,
  Sparkles,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Guest, WeddingConfig } from '../types/wedding';
import {
  buildSheetRowPayload,
  fetchGuestsFromGoogleSheet,
  resolveGoogleSheetWebhookUrl,
  submitRowToGoogleSheet,
} from '../utils/googleSheetSync';

interface SetupGuestLinkPageProps {
  config: WeddingConfig;
  guests: Guest[];
  onUpdateGuests: (guests: Guest[]) => void;
  onUpdateConfig?: (config: WeddingConfig) => void;
  onBackToHome: (guestName?: string) => void;
}

const PAGE_SIZE = 20;

export const SetupGuestLinkPage: React.FC<SetupGuestLinkPageProps> = ({
  config,
  guests,
  onUpdateGuests,
  onBackToHome,
}) => {
  const [inviteeName, setInviteeName] = useState('Quý khách');
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sheetGuests, setSheetGuests] = useState<Guest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const webhookUrl = resolveGoogleSheetWebhookUrl(config);

  const buildInviteUrl = (name: string) => {
    const trimmed = name.trim();
    const baseUrl = `${window.location.origin}/`;
    if (!trimmed) return baseUrl;
    return `${baseUrl}?name=${encodeURIComponent(trimmed)}`;
  };

  const currentGeneratedUrl = buildInviteUrl(inviteeName);

  const handleCopyUrl = (url: string, id?: string) => {
    navigator.clipboard.writeText(url);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } else {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2200);
    }
  };

  const onUpdateGuestsRef = useRef(onUpdateGuests);
  useEffect(() => {
    onUpdateGuestsRef.current = onUpdateGuests;
  }, [onUpdateGuests]);

  const isSyncingRef = useRef(false);

  // Synchronize guest rows from GOOGLE_SHEET_WEB_APP_URL
  const syncFromGoogleSheet = useCallback(async () => {
    if (!webhookUrl) {
      setSheetGuests([]);
      return;
    }

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const fetched = await fetchGuestsFromGoogleSheet(webhookUrl);
      if (fetched !== null) {
        setSheetGuests(fetched);
        onUpdateGuestsRef.current?.(fetched);
      } else {
        setSyncMessage('Không thể tải dữ liệu từ Google Sheet. Vui lòng kiểm tra lại GOOGLE_SHEET_WEB_APP_URL.');
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [webhookUrl]);

  useEffect(() => {
    syncFromGoogleSheet();
  }, [syncFromGoogleSheet]);

  // Active list displayed: strictly synced from Google Sheet without demo fallback
  const displayedGuests = sheetGuests;

  const totalPages = Math.max(1, Math.ceil(displayedGuests.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedGuests = displayedGuests.slice(startIdx, startIdx + PAGE_SIZE);

  const handleSaveToGuestList = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteeName.trim();
    if (!trimmed) return;

    handleCopyUrl(buildInviteUrl(trimmed));

    if (!webhookUrl) {
      setSyncMessage(
        'Đã sao chép link thiệp! (Chưa có biến môi trường GOOGLE_SHEET_WEB_APP_URL nên không lưu vào Google Sheet)'
      );
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    const nextStt = displayedGuests.length + 1;
    const payload = buildSheetRowPayload({
      stt: nextStt,
      name: trimmed,
      status: 'pending',
      attendeesCount: 0,
    });

    const ok = await submitRowToGoogleSheet(webhookUrl, payload);
    if (ok) {
      const newGuest: Guest = {
        id: `sheet-${nextStt}-${Date.now()}`,
        name: trimmed,
        relationship: 'Khách quý',
        group: 'Bạn Chú rể',
        phone: '',
        status: 'pending',
        attendeesCount: 0,
        customSlug: encodeURIComponent(trimmed),
      };
      const updated = [...displayedGuests, newGuest];
      setSheetGuests(updated);
      onUpdateGuests(updated);
      setCurrentPage(Math.ceil(updated.length / PAGE_SIZE));

      // Re-sync after a brief delay so Google Sheet's latest rows are reflected
      setTimeout(() => {
        syncFromGoogleSheet();
      }, 1200);
    } else {
      setSyncMessage('Không thể lưu vào Google Sheet. Vui lòng kiểm tra lại GOOGLE_SHEET_WEB_APP_URL.');
    }
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 py-8 px-4 sm:px-6 font-sans-clean">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onBackToHome(inviteeName.trim() || undefined)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#721319] hover:border-[#721319]/30 text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang thiệp cưới</span>
          </button>
        </div>

        {/* Main Generator Card */}
        <div className="bg-white rounded-3xl shadow-md border border-stone-200/90 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5 border-b border-stone-100 pb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#721319] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo Thiệp Mời Cá Nhân Hóa</span>
            </span>
            <h1 className="font-calligraphy text-4xl sm:text-5xl text-stone-900 pt-1">
              {config.groomName} &amp; {config.brideName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Nhập tên khách mời để tạo đường dẫn tự động điền tên lên thiệp và biểu mẫu xác nhận tham dự
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSaveToGuestList} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-2">
                Tên người được mời (hiển thị trên thiệp &amp; tự động điền Họ tên)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  placeholder="Ví dụ: Bạn Thuỳ Linh, Anh Quốc Bảo, Chị Mai Anh..."
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 text-sm sm:text-base font-medium focus:bg-white focus:outline-none focus:border-[#721319] transition-colors"
                />
              </div>
            </div>

            {/* Live Preview of Invitation Sentence before "Thời gian" */}
            <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/90 space-y-1.5 text-center">
              <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Xem trước lời mời hiển thị trước mục &ldquo;Thời gian&rdquo;
              </span>
              <p className="font-serif-editorial italic text-base sm:text-lg text-stone-800 leading-relaxed">
                Trân trọng kính mời{' '}
                <span className="font-semibold not-italic text-[#721319] underline decoration-[#721319]/35 underline-offset-4">
                  {inviteeName.trim() || 'Quý khách'}
                </span>{' '}
                đến tham dự buổi tiệc rượu chung vui cùng gia đình chúng tôi.
              </p>
            </div>

            {/* Generated URL Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-600">
                Liên kết URL cá nhân hóa
              </label>
              <div className="flex items-center gap-2 p-2 pl-3.5 rounded-2xl bg-stone-100 border border-stone-200">
                <Link2 className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={currentGeneratedUrl}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-transparent text-xs sm:text-sm text-stone-700 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyUrl(currentGeneratedUrl)}
                  className="px-3.5 py-2 rounded-xl bg-[#721319] hover:bg-[#5a0e13] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  {copiedCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Lưu vào danh sách &amp; Chép link</span>
              </button>

              <button
                type="button"
                onClick={() => onBackToHome(inviteeName.trim() || undefined)}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#721319] border border-[#721319]/20 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở thiệp với tên này</span>
              </button>
            </div>

            {syncMessage && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                {syncMessage}
              </p>
            )}
          </form>
        </div>

        {/* Synchronized Paginated Guest List (20 rows per page) from Google Sheet */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#721319]" />
              <span>
                Danh sách khách mời đồng bộ Google Sheet ({displayedGuests.length})
              </span>
            </h2>

            {webhookUrl && (
              <button
                type="button"
                onClick={syncFromGoogleSheet}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
              </button>
            )}
          </div>

          {!webhookUrl ? (
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-stone-700">
                Chưa thiết lập biến môi trường <code className="text-[#721319]">GOOGLE_SHEET_WEB_APP_URL</code>
              </p>
              <p className="text-xs text-stone-500">
                Khi biến môi trường <code>GOOGLE_SHEET_WEB_APP_URL</code> được cấu hình, danh sách khách mời từ Google Sheet sẽ tự động đồng bộ và hiển thị phân trang (20 dòng/trang) tại đây.
              </p>
            </div>
          ) : displayedGuests.length === 0 ? (
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
              {isSyncing
                ? 'Đang tải danh sách từ Google Sheet...'
                : 'Chưa có dữ liệu khách mời trên Google Sheet.'}
            </div>
          ) : (
            <>
              {/* 4-Column Synchronized Table (STT | Họ tên | Bình chọn | Số lượng | Liên kết) */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden">
                <div className="grid grid-cols-12 bg-stone-100 border-b border-stone-200 py-2.5 px-3 text-xs font-bold text-stone-700 items-center">
                  <div className="col-span-1">STT</div>
                  <div className="col-span-4">Họ tên</div>
                  <div className="col-span-3">Bình chọn</div>
                  <div className="col-span-1 text-center">SL</div>
                  <div className="col-span-3 text-right">Liên kết</div>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {paginatedGuests.map((guest, idx) => {
                    const stt = startIdx + idx + 1;
                    const guestUrl = buildInviteUrl(guest.name);
                    const isCopied = copiedId === guest.id;
                    const voteLabel =
                      guest.status === 'declined'
                        ? 'Bận không tới được'
                        : guest.status === 'attending'
                        ? 'Sẽ tham dự'
                        : '';
                    const countVal =
                      guest.status === 'declined'
                        ? 0
                        : guest.status === 'attending'
                        ? guest.attendeesCount || 1
                        : guest.attendeesCount ?? 0;

                    return (
                      <div
                        key={guest.id || stt}
                        className="grid grid-cols-12 py-2.5 px-3 items-center text-stone-800 hover:bg-stone-50/80 transition-colors"
                      >
                        <div className="col-span-1 font-mono font-semibold text-stone-500">
                          {stt}
                        </div>
                        <div className="col-span-4 font-semibold text-stone-900 truncate pr-2">
                          {guest.name}
                        </div>
                        <div className="col-span-3 pr-1">
                          {voteLabel ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                guest.status === 'declined'
                                  ? 'bg-stone-200 text-stone-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {voteLabel}
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">
                              (Trống)
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 text-center font-mono font-bold">
                          {countVal}
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(guestUrl, guest.id)}
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Sao chép link thiệp"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">
                              {isCopied ? 'Đã chép' : 'Chép'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onBackToHome(guest.name)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#721319] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Mở xem thiệp của khách này"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Xem</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Controls (20 rows per page) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-stone-600">
                <span>
                  Hiển thị dòng{' '}
                  <strong>
                    {startIdx + 1}&ndash;{Math.min(startIdx + PAGE_SIZE, displayedGuests.length)}
                  </strong>{' '}
                  trong tổng số <strong>{displayedGuests.length}</strong> khách (20 dòng/trang)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-2.5 py-1 font-semibold text-stone-800">
                    Trang {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
