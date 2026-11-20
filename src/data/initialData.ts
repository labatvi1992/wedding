import { Guest, GuestWish, WeddingConfig } from '../types/wedding';

// ============================================================================
// BIẾN TÊN CHÚ RỂ & CÔ DÂU RIÊNG BIỆT CHO TỪNG PHẦN (DỄ DÀNG CHỈNH SỬA)
// ============================================================================

// 1. Tên hiển thị ở ảnh mở đầu (Ngày Chung Đôi)
export const HERO_GROOM_NAME = 'Đặng Long Vi';
export const HERO_BRIDE_NAME = 'Trần Mỹ Quỳnh';

// 2. Tên hiển thị trên khung ảnh chân dung Chú rể & Cô dâu (phần Đếm Ngược)
export const CARD_GROOM_NAME = 'Long Vi';
export const CARD_BRIDE_NAME = 'Mỹ Quỳnh';

// 3. Tên hiển thị ở phần Thiệp Mời Lễ Thành Hôn (dưới thông tin Nhà Trai - Nhà Gái)
export const INVITATION_GROOM_NAME = 'Đặng Long Vi';
export const INVITATION_BRIDE_NAME = 'Trần Mỹ Quỳnh';

// 4. Tên ngắn gọn & Tên đầy đủ mặc định
export const GROOM_FULL_NAME = 'Đặng Long Vi';
export const BRIDE_FULL_NAME = 'Trần Mỹ Quỳnh';
export const GROOM_SHORT_NAME = 'Long Vi';
export const BRIDE_SHORT_NAME = 'Mỹ Quỳnh';

// 5. Biến môi trường GOOGLE_SHEET_WEB_APP_URL để đồng bộ 2 chiều (GET/POST) với Google Sheet "Danh sách mời cưới"
// Cột ánh xạ: STT (tự tăng) | Họ tên | Vote | Số lượng
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
export const GOOGLE_SHEET_WEB_APP_URL =
  metaEnv?.GOOGLE_SHEET_WEB_APP_URL ||
  metaEnv?.VITE_GOOGLE_SHEET_WEB_APP_URL ||
  (typeof process !== 'undefined' && process.env?.GOOGLE_SHEET_WEB_APP_URL) ||
  '';

export const DEMO_IMAGES = {
  bridePortrait: '/assets/aistudio/Hinh-Co-Dau_2e27414f.JPG',
  groomPortrait: '/assets/aistudio/Hinh-Chu-Re_4c7c4f1d.JPG',
  coupleForever: '/assets/aistudio/Hinh-Mai-Ben-Nhau_1e080bab.JPG',
};

export const INITIAL_WEDDING_CONFIG: WeddingConfig = {
  groomName: GROOM_FULL_NAME,
  brideName: BRIDE_FULL_NAME,
  groomShortName: GROOM_SHORT_NAME,
  brideShortName: BRIDE_SHORT_NAME,
  heroGroomName: HERO_GROOM_NAME,
  heroBrideName: HERO_BRIDE_NAME,
  cardGroomName: CARD_GROOM_NAME,
  cardBrideName: CARD_BRIDE_NAME,
  invitationGroomName: INVITATION_GROOM_NAME,
  invitationBrideName: INVITATION_BRIDE_NAME,
  groomFamily: {
    father: '',
    mother: 'Bà. Trần Thị Thuý Hiệp',
    address: '12 Lý Thường Kiệt - Xã Bình Dương - Tỉnh Gia Lai',
    phone: '0912345678',
    zaloPhone: '0912345678',
  },
  brideFamily: {
    father: 'Ông. Trần Văn Sáu',
    mother: 'Bà. Lưu Thị Bích Hoa',
    address: '146 Ngô Văn Sở - Phường An Khê - Tỉnh Gia Lai',
    phone: '0987654321',
    zaloPhone: '0987654321',
  },
  weddingDate: '2026-12-20',
  weddingTime: '11:00',
  calendarHeartDay: 20,
  ceremonyDay: 20,
  ceremonyMonth: 'THÁNG 12',
  ceremonyYear: 'NĂM 2026',
  lunarDate: '(Tức ngày 12 tháng 11 năm Bính Ngọ)',
  venueName: 'Trung tâm tiệc cưới Ngọc Bích Palace',
  venueHall: 'Trung tâm tiệc cưới Ngọc Bích Palace',
  venueAddress: 'Đường Nguyễn Lữ - Xã Bình Dương - Tỉnh Gia Lai',
  googleMapsUrl: 'https://maps.app.goo.gl/dU7A8hXzqtGbRcP98?g_st=ic',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=73RP%2BHQG%20Nh%C3%A0%20h%C3%A0ng%20ti%E1%BB%87c%C6%B0%E1%BB%9Bi%20Ng%E1%BB%8Dc%20B%C3%ADch%20Palace,%20B%C3%ACnh%20D%C6%B0%C6%A1ng,%20Gia%20Lai&t=&z=16&ie=UTF8&iwloc=&output=embed',
  googleSheetUrl: GOOGLE_SHEET_WEB_APP_URL,
  googleSheetWebAppUrl: GOOGLE_SHEET_WEB_APP_URL,
  backgroundMusicUrl: '/assets/aistudio/love-paradise.mp3',
};

export const INITIAL_GUESTS: Guest[] = [];

export const INITIAL_WISHES: GuestWish[] = [
  {
    id: 'w-1',
    author: 'Đỗ Thu Hà',
    relationship: 'Bạn thân cô dâu',
    content: 'Mong tình yêu của hai bạn mãi vĩnh cửu, ngọt ngào và tràn ngập tiếng cười như ngày đầu!',
    createdAt: 'Vừa xong',
  },
  {
    id: 'w-2',
    author: 'Trần Quốc Bảo',
    relationship: 'Bạn thân chú rể',
    content: 'Chúc người anh em Đặng Long Vi và Trần Mỹ Quỳnh trăm năm viên mãn hạnh phúc!',
    createdAt: '5 phút trước',
  },
  {
    id: 'w-3',
    author: 'Hoàng Nam & Mai Linh',
    relationship: 'Bạn cấp 3',
    content: 'Cuối cùng ngày này cũng tới! Chúc hai bạn luôn ngập tràn yêu thương và về chung một lối thật hạnh phúc.',
    createdAt: '15 phút trước',
  },
];

export const WEDDING_GALLERY_IMAGES = [
  {
    url: '/assets/aistudio/MIN_1978_Original_fb5ba9f5.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 01',
  },
  {
    url: '/assets/aistudio/MIN_1761_Original_0c4020af.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 02',
  },
  {
    url: '/assets/aistudio/MIN_1689_Original_e3189cb5.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 03',
  },
  {
    url: '/assets/aistudio/MIN_1591_Original_1e070ffb.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 04',
  },
  {
    url: '/assets/aistudio/MIN_2120_Original_8833b15d.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 05',
  },
  {
    url: '/assets/aistudio/MIN_2126_Original_08495081.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 06',
  },
  {
    url: '/assets/aistudio/MIN_1515_Original_5b0bf2a7.jpeg',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 07',
  },
];

export const LOVE_STORY_STEPS = [
  {
    year: '09:00',
    title: 'Lễ Thành Hôn',
    desc: 'Tư gia nhà trai',
  },
  {
    year: '11:00',
    title: 'Tiệc Cưới',
    desc: 'Trung tâm tiệc cưới',
  },
];
