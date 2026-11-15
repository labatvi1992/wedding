export interface Guest {
  id: string;
  name: string;
  relationship: string;
  group: 'Nhà trai' | 'Nhà gái' | 'Bạn Chú rể' | 'Bạn Cô dâu' | 'Đồng nghiệp' | 'Họ hàng';
  phone: string;
  tableNumber?: string;
  status: 'pending' | 'attending' | 'declined';
  attendeesCount: number;
  dietaryPreference?: 'standard' | 'vegetarian' | 'halal' | 'none';
  customSlug?: string;
  wish?: string;
  giftAmount?: number;
  invitedViaZalo?: boolean;
  confirmedAt?: string;
  notes?: string;
}

export interface GuestStats {
  totalInvited: number;
  totalConfirmedGuests: number;
  totalActualAttendees: number;
  totalDeclined: number;
  totalPending: number;
  totalGiftAmount: number;
}

export interface WeddingConfig {
  groomName: string;
  brideName: string;
  groomDob?: string;
  brideDob?: string;
  groomFamily: {
    father: string;
    mother: string;
    address: string;
    phone: string;
    zaloPhone: string;
  };
  brideFamily: {
    father: string;
    mother: string;
    address: string;
    phone: string;
    zaloPhone: string;
  };
  weddingDate: string; // '2026-12-20'
  weddingTime: string; // '11:00'
  calendarHeartDay?: number; // 20
  ceremonyDay?: number; // 20
  ceremonyMonth?: string; // 'THÁNG 12'
  ceremonyYear?: string; // 'NĂM 2026'
  lunarDate?: string; // '(Tức ngày 09 tháng 08 năm Đinh Mùi)'
  venueName: string;
  venueHall: string;
  venueAddress: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  googleSheetUrl: string;
  backgroundMusicUrl: string;
}

export interface GuestWish {
  id: string;
  author: string;
  relationship: string;
  content: string;
  createdAt: string;
}
