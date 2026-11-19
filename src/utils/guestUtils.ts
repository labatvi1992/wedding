import { Guest, GuestStats } from '../types/wedding';

/**
 * Calculates aggregate stats for wedding guests
 */
export function calculateGuestStats(guests: Guest[]): GuestStats {
  let totalConfirmedGuests = 0;
  let totalActualAttendees = 0;
  let totalDeclined = 0;
  let totalPending = 0;
  let totalGiftAmount = 0;

  for (const guest of guests) {
    if (guest.status === 'attending') {
      totalConfirmedGuests += 1;
      totalActualAttendees += Math.max(1, guest.attendeesCount || 1);
    } else if (guest.status === 'declined') {
      totalDeclined += 1;
    } else {
      totalPending += 1;
    }

    if (guest.giftAmount && guest.giftAmount > 0) {
      totalGiftAmount += guest.giftAmount;
    }
  }

  return {
    totalInvited: guests.length,
    totalConfirmedGuests,
    totalActualAttendees,
    totalDeclined,
    totalPending,
    totalGiftAmount,
  };
}

/**
 * Generates structured text message for guest RSVP confirmation to send via Zalo
 */
export function generateZaloRSVPMessage(params: {
  guestName: string;
  phone: string;
  status: 'attending' | 'declined';
  attendeesCount: number;
  dietaryPreference?: string;
  wish?: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
}): string {
  const { guestName, phone, status, attendeesCount, wish, groomName, brideName, weddingDate } = params;

  if (status === 'attending') {
    let msg = `💍 XÁC NHẬN THAM DỰ HÔN LỄ ${groomName.toUpperCase()} & ${brideName.toUpperCase()}\n`;
    msg += `------------------------------------\n`;
    msg += `Kính gửi hai bạn,\n`;
    msg += `Tôi là: ${guestName.trim()}\n`;
    if (phone) msg += `Số điện thoại: ${phone.trim()}\n`;
    msg += `Trạng thái: ✅ CHẮC CHẮN SẼ THAM DỰ\n`;
    msg += `Số lượng người tham dự: ${attendeesCount} người\n`;
    msg += `Ngày cưới: ${weddingDate}\n`;
    if (wish && wish.trim()) {
      msg += `Lời chúc phúc: "${wish.trim()}"\n`;
    }
    msg += `------------------------------------\nRất mong chờ ngày vui của hai bạn!`;
    return msg;
  } else {
    let msg = `💍 PHẢN HỒI THIỆP CƯỚI ${groomName.toUpperCase()} & ${brideName.toUpperCase()}\n`;
    msg += `------------------------------------\n`;
    msg += `Kính gửi hai bạn,\n`;
    msg += `Tôi là: ${guestName.trim()}\n`;
    if (phone) msg += `Số điện thoại: ${phone.trim()}\n`;
    msg += `Trạng thái: ❌ Rất tiếc không thể tham dự do có lịch bận\n`;
    if (wish && wish.trim()) {
      msg += `Lời chúc phúc: "${wish.trim()}"\n`;
    }
    msg += `------------------------------------\nChúc hai bạn trăm năm hạnh phúc, vẹn tròn duyên mới!`;
    return msg;
  }
}

/**
 * Generates wedding invitation invitation text for groom/bride to send to guest via Zalo
 */
export function generateZaloInviteMessage(params: {
  guestName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  invitationUrl: string;
}): string {
  const { guestName, groomName, brideName, weddingDate, weddingTime, venueName, venueAddress, invitationUrl } = params;

  return `💌 TRÂN TRỌNG KÍNH MỜI: ${guestName.toUpperCase()}\n` +
    `Tới dự Lễ Thành Hôn chung vui cùng gia đình chúng tôi:\n` +
    `🤵 Chú rể: ${groomName}\n` +
    `👰 Cô dâu: ${brideName}\n\n` +
    `⏰ Thời gian: ${weddingTime} - Ngày ${weddingDate}\n` +
    `📍 Địa điểm: ${venueName}\n` +
    `🏢 Địa chỉ: ${venueAddress}\n\n` +
    `👉 Xem thiệp cưới online và xác nhận tham dự tại link:\n` +
    `${invitationUrl}\n\n` +
    `Sự hiện diện của ${guestName} là niềm vinh hạnh to lớn cho chúng tôi! ❤️`;
}

/**
 * Filter guests based on search text, group, and status
 */
export function filterGuests(
  guests: Guest[],
  searchQuery: string,
  selectedGroup: string,
  selectedStatus: string
): Guest[] {
  const query = searchQuery.trim().toLowerCase();

  return guests.filter((guest) => {
    const matchesSearch =
      !query ||
      guest.name.toLowerCase().includes(query) ||
      guest.phone.includes(query) ||
      (guest.relationship && guest.relationship.toLowerCase().includes(query)) ||
      (guest.tableNumber && guest.tableNumber.toLowerCase().includes(query));

    const matchesGroup = selectedGroup === 'all' || guest.group === selectedGroup;
    const matchesStatus = selectedStatus === 'all' || guest.status === selectedStatus;

    return matchesSearch && matchesGroup && matchesStatus;
  });
}

/**
 * Currency formatter for VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Calculate countdown days, hours, minutes, seconds.
 * Clamps all units to a minimum of 0 once the target date is reached or passed.
 */
export function calculateCountdown(targetDateStr: string, fromDate: Date = new Date()) {
  const trimmed = (targetDateStr || '').trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const target = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
        0,
        0,
        0,
        0
      ).getTime()
    : new Date(trimmed).getTime();

  const now = fromDate.getTime();

  if (!Number.isFinite(target) || !Number.isFinite(now) || target <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const diff = Math.max(0, target - now);

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

  return { days, hours, minutes, seconds, isPast: diff <= 0 };
}

/**
 * Formats guest RSVP data into a structured row format for Google Sheets
 */
export function formatGoogleSheetRow(params: {
  timestamp?: string;
  name: string;
  phone: string;
  group: string;
  status: 'attending' | 'declined' | 'pending';
  attendeesCount: number;
  dietaryPreference?: string;
  wish?: string;
}): string[] {
  return [
    params.timestamp || new Date().toLocaleString('vi-VN'),
    params.name,
    params.phone || '',
    params.group,
    params.status === 'attending' ? 'Tham gia' : params.status === 'declined' ? 'Không tham gia' : 'Chưa phản hồi',
    params.attendeesCount.toString(),
    params.dietaryPreference || 'Tiêu chuẩn',
    params.wish || '',
  ];
}

