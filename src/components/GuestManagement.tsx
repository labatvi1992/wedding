import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  Edit2,
  Trash2,
  Settings,
  Music,
  ExternalLink,
} from 'lucide-react';
import { Guest, WeddingConfig, GuestWish } from '../types/wedding';
import {
  calculateGuestStats,
  filterGuests,
  formatCurrency,
} from '../utils/guestUtils';
import { weddingAudioPlayer } from '../utils/audioSynth';

interface GuestManagementProps {
  guests: Guest[];
  config: WeddingConfig;
  wishes: GuestWish[];
  onUpdateGuests: (updatedGuests: Guest[]) => void;
  onUpdateConfig: (updatedConfig: WeddingConfig) => void;
  onBackToInvitation: () => void;
}

export const GuestManagement: React.FC<GuestManagementProps> = ({
  guests,
  config,
  wishes,
  onUpdateGuests,
  onUpdateConfig,
  onBackToInvitation,
}) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'settings'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [copiedLinkFor, setCopiedLinkFor] = useState<string | null>(null);
  const [copiedSheetLink, setCopiedSheetLink] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('Bạn bè');
  const [formGroup, setFormGroup] = useState<Guest['group']>('Bạn Chú rể');
  const [formStatus, setFormStatus] = useState<Guest['status']>('pending');
  const [formAttendeesCount, setFormAttendeesCount] = useState<number>(1);
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formGiftAmount, setFormGiftAmount] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  // Audio settings state
  const [audioInputUrl, setAudioInputUrl] = useState(config.backgroundMusicUrl || '');
  const [audioUploadName, setAudioUploadName] = useState<string>('');

  // Google Sheet URL setting state
  const [sheetInputUrl, setSheetInputUrl] = useState(config.googleSheetUrl || '');

  const stats = calculateGuestStats(guests);
  const filteredGuests = filterGuests(guests, searchQuery, selectedGroup, selectedStatus);

  const getPersonalizedUrl = (guest: Guest) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const slug = guest.customSlug || encodeURIComponent(guest.name);
    return `${origin}${path}?guest=${slug}`;
  };

  const handleCopyGuestLink = (guest: Guest) => {
    const url = getPersonalizedUrl(guest);
    navigator.clipboard.writeText(url);
    setCopiedLinkFor(guest.id);
    setTimeout(() => setCopiedLinkFor(null), 2500);
  };

  const handleCopySheetLink = () => {
    navigator.clipboard.writeText(config.googleSheetUrl);
    setCopiedSheetLink(true);
    setTimeout(() => setCopiedSheetLink(false), 2500);
  };

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setFormName('');
    setFormPhone('');
    setFormRelationship('Bạn bè');
    setFormGroup('Bạn Chú rể');
    setFormStatus('pending');
    setFormAttendeesCount(1);
    setFormTableNumber('');
    setFormGiftAmount(0);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormPhone(guest.phone || '');
    setFormRelationship(guest.relationship || 'Bạn bè');
    setFormGroup(guest.group);
    setFormStatus(guest.status);
    setFormAttendeesCount(guest.attendeesCount || 1);
    setFormTableNumber(guest.tableNumber || '');
    setFormGiftAmount(guest.giftAmount || 0);
    setFormNotes(guest.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveGuestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingGuest) {
      const updated = guests.map((g) =>
        g.id === editingGuest.id
          ? {
              ...g,
              name: formName.trim(),
              phone: formPhone.trim(),
              relationship: formRelationship,
              group: formGroup,
              status: formStatus,
              attendeesCount: formStatus === 'attending' ? formAttendeesCount : 0,
              tableNumber: formTableNumber.trim(),
              giftAmount: Number(formGiftAmount) || 0,
              notes: formNotes.trim(),
            }
          : g
      );
      onUpdateGuests(updated);
    } else {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        relationship: formRelationship,
        group: formGroup,
        status: formStatus,
        attendeesCount: formStatus === 'attending' ? formAttendeesCount : 0,
        tableNumber: formTableNumber.trim(),
        giftAmount: Number(formGiftAmount) || 0,
        notes: formNotes.trim(),
        customSlug: encodeURIComponent(formName.trim().toLowerCase().replace(/\s+/g, '-')),
      };
      onUpdateGuests([newGuest, ...guests]);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteGuest = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách mời "${name}" khỏi danh sách?`)) {
      onUpdateGuests(guests.filter((g) => g.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã', 'Họ tên', 'Quan hệ', 'Nhóm', 'SĐT', 'Trạng thái', 'Số người đi cùng', 'Bàn số', 'Tiền mừng', 'Ghi chú'];
    const rows = guests.map((g) => [
      g.id,
      `"${g.name}"`,
      `"${g.relationship || ''}"`,
      `"${g.group}"`,
      `"${g.phone || ''}"`,
      g.status === 'attending' ? 'Đã xác nhận' : g.status === 'declined' ? 'Từ chối' : 'Chưa phản hồi',
      g.attendeesCount || 0,
      `"${g.tableNumber || ''}"`,
      g.giftAmount || 0,
      `"${g.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_khach_cuoi_${config.groomName}_${config.brideName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioUploadName(file.name);
      const fileUrl = URL.createObjectURL(file);
      weddingAudioPlayer.setCustomAudioUrl(fileUrl);
      onUpdateConfig({
        ...config,
        backgroundMusicUrl: fileUrl,
      });
    }
  };

  const handleApplyAudioUrl = () => {
    if (audioInputUrl.trim()) {
      weddingAudioPlayer.setCustomAudioUrl(audioInputUrl.trim());
      onUpdateConfig({
        ...config,
        backgroundMusicUrl: audioInputUrl.trim(),
      });
      alert('Đã cập nhật nguồn nhạc nền!');
    }
  };

  const handleSaveSheetUrl = () => {
    onUpdateConfig({
      ...config,
      googleSheetUrl: sheetInputUrl.trim(),
    });
    alert('Đã cập nhật link Google Sheet phản hồi thành công!');
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToInvitation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors cursor-pointer"
          >
            <span>← Xem Thiệp Cưới</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Quản Lý Khách Mời & Google Sheet</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-[10px] text-rose-300">
                Thanh Huy & Phương Thúy
              </span>
            </h1>
          </div>
        </div>

        {/* Tab navigation & Direct Google Sheet Button */}
        <div className="flex items-center gap-2">
          {config.googleSheetUrl && (
            <a
              href={config.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Mở Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          )}

          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Khách Mời ({guests.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Google Sheet & Âm Thanh
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Google Sheet Direct Status Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-950 to-stone-900 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Đồng Bộ Google Sheet Công Khai</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-[10px] font-mono">
                      Hoạt động
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Khách mời phản hồi qua thiệp online sẽ được lưu trữ và cập nhật vào trang Google Sheet công khai.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopySheetLink}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSheetLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép link Sheet</span>
                    </>
                  )}
                </button>
                <a
                  href={config.googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Mở Bảng Tính</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs">Tổng khách</span>
                  <Users className="w-4 h-4 text-stone-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-white">{stats.totalInvited}</p>
                <span className="text-[10px] text-stone-500">Khách trong danh sách</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-emerald-900/40 shadow-sm">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-xs">Đã xác nhận</span>
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold font-serif text-emerald-400">{stats.totalConfirmedGuests}</p>
                <span className="text-[10px] text-emerald-500/80">Khách báo tham gia</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-900/40 shadow-sm">
                <div className="flex items-center justify-between text-amber-400 mb-1">
                  <span className="text-xs">Số người đi kèm</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold font-serif text-amber-300">{stats.totalActualAttendees}</p>
                <span className="text-[10px] text-amber-500/80">Người dự tiệc thực tế</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs">Chưa phản hồi</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-amber-400">{stats.totalPending}</p>
                <span className="text-[10px] text-stone-500">Cần liên hệ nhắc</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs">Từ chối</span>
                  <UserX className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-rose-400">{stats.totalDeclined}</p>
                <span className="text-[10px] text-stone-500">Báo bận không đến</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs">Bàn tiệc</span>
                  <Users className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-base sm:text-lg font-bold font-serif text-amber-300 truncate">
                  ~{Math.ceil(stats.totalActualAttendees / 10)} Bàn
                </p>
                <span className="text-[10px] text-stone-500">Dự kiến xếp chỗ</span>
              </div>
            </div>

            {/* Action Bar & Filters */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên khách, SĐT, bàn tiệc..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">Tất cả nhóm</option>
                  <option value="Nhà trai">Nhà trai</option>
                  <option value="Nhà gái">Nhà gái</option>
                  <option value="Bạn Chú rể">Bạn Chú rể</option>
                  <option value="Bạn Cô dâu">Bạn Cô dâu</option>
                  <option value="Đồng nghiệp">Đồng nghiệp</option>
                  <option value="Họ hàng">Họ hàng</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="attending">Đã xác nhận</option>
                  <option value="pending">Chưa phản hồi</option>
                  <option value="declined">Từ chối</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất danh sách ra file Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Khách Mới</span>
                </button>
              </div>
            </div>

            {/* Guest List Table */}
            <div className="rounded-2xl bg-stone-950/80 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="px-4 py-3.5">Khách Mời</th>
                      <th className="px-3 py-3.5">Nhóm / Quan hệ</th>
                      <th className="px-3 py-3.5">Số Điện Thoại</th>
                      <th className="px-3 py-3.5">Trạng Thái RSVP</th>
                      <th className="px-3 py-3.5 text-center">Người Đi Cùng</th>
                      <th className="px-3 py-3.5">Bàn Số</th>
                      <th className="px-4 py-3.5 text-right">Link Thiệp Cá Nhân Hóa & Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-stone-500 text-xs">
                          Không tìm thấy khách mời nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-stone-900/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">
                            <div className="flex flex-col">
                              <span>{guest.name}</span>
                              {guest.wish && (
                                <span className="text-[11px] text-stone-400 italic line-clamp-1">
                                  "{guest.wish}"
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col">
                              <span className="text-stone-300">{guest.group}</span>
                              <span className="text-[10px] text-stone-500">{guest.relationship}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-stone-300">
                            {guest.phone || '—'}
                          </td>
                          <td className="px-3 py-3">
                            {guest.status === 'attending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-semibold">
                                <UserCheck className="w-3 h-3" />
                                <span>Tham gia</span>
                              </span>
                            ) : guest.status === 'declined' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 text-[11px] font-semibold">
                                <UserX className="w-3 h-3" />
                                <span>Bận / Vắng</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 text-[11px]">
                                <Clock className="w-3 h-3" />
                                <span>Chưa phản hồi</span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold text-stone-200">
                            {guest.status === 'attending' ? guest.attendeesCount || 1 : '—'}
                          </td>
                          <td className="px-3 py-3 font-mono text-stone-400">
                            {guest.tableNumber || '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copy Personalized Link Button */}
                              <button
                                onClick={() => handleCopyGuestLink(guest)}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                title="Sao chép link thiệp cá nhân hóa"
                              >
                                {copiedLinkFor === guest.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[11px]">Đã chép link</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Chép link thiệp</span>
                                  </>
                                )}
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditModal(guest)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Xóa khỏi danh sách"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings, Google Sheet & Audio */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Google Sheet Configuration */}
            <div className="p-6 rounded-2xl bg-stone-950/90 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Cấu Hình Đường Dẫn Google Sheet Công Khai</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Người dùng yêu cầu: "Không gửi phản hồi qua Zalo mà sẽ qua một trang Google Sheet được share công khai". Dán đường link Google Sheet bạn đã tạo và chia sẻ quyền xem (hoặc Google Form / Apps Script webhook) vào đây:
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Link Google Sheet công khai (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={sheetInputUrl}
                      onChange={(e) => setSheetInputUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-600 font-mono"
                    />
                    <button
                      onClick={handleSaveSheetUrl}
                      className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Lưu Link
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Kiểm tra liên kết:</span>
                    <a
                      href={config.googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      <span>Mở thử trang Google Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-normal">
                    💡 Hướng dẫn: Mở Google Sheets của bạn, bấm nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải &gt; chọn <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong> &gt; Sao chép liên kết và dán vào ô trên.
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Management */}
            <div className="p-6 rounded-2xl bg-stone-950/90 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
                <Music className="w-4 h-4" />
                <span>Cài Đặt Âm Thanh & Nhạc Nền Thiệp Cưới</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Người dùng yêu cầu: "Âm thanh tôi sẽ đưa vào sau". Tại đây bạn có thể tải lên file MP3 bài hát cưới của riêng bạn hoặc nhập URL âm thanh bất cứ lúc nào:
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Cách 1: Tải lên file nhạc MP3 từ máy của bạn
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="block w-full text-xs text-stone-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-900 file:text-white hover:file:bg-rose-800 cursor-pointer"
                  />
                  {audioUploadName && (
                    <p className="text-[11px] text-emerald-400 mt-1">
                      ✓ Đã tải file: {audioUploadName}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Cách 2: Nhập liên kết MP3 trực tiếp (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={audioInputUrl}
                      onChange={(e) => setAudioInputUrl(e.target.value)}
                      placeholder="https://example.com/audio/wedding-song.mp3"
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-rose-600 font-mono"
                    />
                    <button
                      onClick={handleApplyAudioUrl}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wedding General Info Settings */}
            <div className="p-6 rounded-2xl bg-stone-950/90 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
                <Settings className="w-4 h-4" />
                <span>Thông Tin Hôn Lễ & Nhà Hàng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Tên Chú rể</label>
                  <input
                    type="text"
                    value={config.groomName}
                    onChange={(e) => onUpdateConfig({ ...config, groomName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Tên Cô dâu</label>
                  <input
                    type="text"
                    value={config.brideName}
                    onChange={(e) => onUpdateConfig({ ...config, brideName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-400 mb-1">Tên nhà hàng / Trung tâm tiệc cưới</label>
                  <input
                    type="text"
                    value={config.venueName}
                    onChange={(e) => onUpdateConfig({ ...config, venueName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-400 mb-1">Sảnh tiệc</label>
                  <input
                    type="text"
                    value={config.venueHall}
                    onChange={(e) => onUpdateConfig({ ...config, venueHall: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-400 mb-1">Địa chỉ chi tiết nhà hàng</label>
                  <input
                    type="text"
                    value={config.venueAddress}
                    onChange={(e) => onUpdateConfig({ ...config, venueAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-400 mb-1">Link Google Maps nhà hàng (dùng tạo mã QR)</label>
                  <input
                    type="text"
                    value={config.googleMapsUrl}
                    onChange={(e) => onUpdateConfig({ ...config, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-bold text-base text-white">
                {editingGuest ? 'Chỉnh Sửa Khách Mời' : 'Thêm Khách Mời Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuestForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 mb-1">Tên khách mời *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Anh Hoàng Nam & Bạn"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">Nhóm khách</label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value as Guest['group'])}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300"
                  >
                    <option value="Nhà trai">Nhà trai</option>
                    <option value="Nhà gái">Nhà gái</option>
                    <option value="Bạn Chú rể">Bạn Chú rể</option>
                    <option value="Bạn Cô dâu">Bạn Cô dâu</option>
                    <option value="Đồng nghiệp">Đồng nghiệp</option>
                    <option value="Họ hàng">Họ hàng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">Mối quan hệ</label>
                  <input
                    type="text"
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    placeholder="Bạn thân, Đồng nghiệp..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">Trạng thái tham dự</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Guest['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300"
                  >
                    <option value="pending">Chưa phản hồi</option>
                    <option value="attending">Đã xác nhận</option>
                    <option value="declined">Từ chối tham dự</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">Số người đi cùng</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formAttendeesCount}
                    onChange={(e) => setFormAttendeesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">Bàn số / Khu vực</label>
                  <input
                    type="text"
                    value={formTableNumber}
                    onChange={(e) => setFormTableNumber(e.target.value)}
                    placeholder="Bàn 01, VIP..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">Tiền mừng (VND)</label>
                  <input
                    type="number"
                    step="100000"
                    value={formGiftAmount}
                    onChange={(e) => setFormGiftAmount(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1">Ghi chú</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Khách cần chuẩn bị thêm ghế trẻ em, ăn chay..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white font-semibold cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
