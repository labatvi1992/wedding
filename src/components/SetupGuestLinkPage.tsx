import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Guest, WeddingConfig } from '../types/wedding';

interface SetupGuestLinkPageProps {
  config: WeddingConfig;
  guests: Guest[];
  onUpdateGuests: (guests: Guest[]) => void;
  onBackToHome: (guestName?: string) => void;
}

export const SetupGuestLinkPage: React.FC<SetupGuestLinkPageProps> = ({
  config,
  guests,
  onUpdateGuests,
  onBackToHome,
}) => {
  const [inviteeName, setInviteeName] = useState('Quý khách');
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleSaveToGuestList = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteeName.trim();
    if (!trimmed) return;

    const existing = guests.find(
      (g) => g.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!existing) {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: trimmed,
        relationship: 'Khách quý',
        group: 'Bạn Chú rể',
        phone: '',
        status: 'pending',
        attendeesCount: 1,
        customSlug: encodeURIComponent(trimmed),
      };
      onUpdateGuests([newGuest, ...guests]);
    }
    handleCopyUrl(buildInviteUrl(trimmed));
  };

  const handleRemoveGuest = (id: string) => {
    onUpdateGuests(guests.filter((g) => g.id !== id));
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

          <span className="text-xs font-medium text-stone-500">
            Đường dẫn: <code className="text-[#721319] font-semibold">/thiet-lap</code>
          </span>
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
              <p className="font-serif-editorial text-base sm:text-lg text-stone-800 leading-relaxed">
                Mời{' '}
                <span className="font-semibold text-[#721319] underline decoration-[#721319]/30 underline-offset-4">
                  {inviteeName.trim() || 'Bạn'}
                </span>{' '}
                đến tham dự tiệc cưới để chung vui cùng gia đình
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
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
          </form>
        </div>

        {/* Saved Guest Links List */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#721319]" />
              <span>Danh sách liên kết khách mời đã tạo ({guests.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto pr-1">
            {guests.map((guest) => {
              const guestUrl = buildInviteUrl(guest.name);
              const isCopied = copiedId === guest.id;
              return (
                <div
                  key={guest.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {guest.name}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono truncate">
                      {guestUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(guestUrl, guest.id)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Chép link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onBackToHome(guest.name)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#721319] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Mở xem thiệp của khách này"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveGuest(guest.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
