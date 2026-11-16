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

export const DEMO_IMAGES = {
  heroCouple: '/assets/aistudio/01-Hinh-Nen_8e97fd58.JPG',
  bridePortrait: '/assets/aistudio/02-Co-Dau_2e27414f.JPG',
  groomPortrait: '/assets/aistudio/03-Chu-Re_4c7c4f1d.JPG',
  coupleCelebration: '/assets/aistudio/03-Chu-Re_4c7c4f1d.JPG',
  coupleForever: '/assets/aistudio/04-Mai-Ben-Nhau_1e080bab.JPG',
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
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=73RP%2BHQG%20Nh%C3%A0%20h%C3%A0ng%20ti%E1%BB%87c%20c%C6%B0%E1%BB%9Bi%20Ng%E1%BB%8Dc%20B%C3%ADch%20Palace,%20B%C3%ACnh%20D%C6%B0%C6%A1ng,%20Gia%20Lai&t=&z=16&ie=UTF8&iwloc=&output=embed',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
  backgroundMusicUrl: '/assets/aistudio/love-paradise.mp3',
};

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'g-1',
    name: 'Anh Trần Quốc Bảo',
    relationship: 'Bạn thân đại học',
    group: 'Bạn Chú rể',
    phone: '0903123456',
    tableNumber: 'Bàn 02',
    status: 'attending',
    attendeesCount: 2,
    dietaryPreference: 'standard',
    customSlug: 'tran-quoc-bao',
    wish: 'Chúc hai bạn Đặng Long Vi & Trần Mỹ Quỳnh trăm năm hạnh phúc, sớm sinh quý tử!',
    giftAmount: 1000000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-15T09:30:00Z',
  },
  {
    id: 'g-2',
    name: 'Chị Lê Thị Mai Anh',
    relationship: 'Đồng nghiệp thân thiết',
    group: 'Đồng nghiệp',
    phone: '0908765432',
    tableNumber: 'Bàn 05',
    status: 'attending',
    attendeesCount: 1,
    dietaryPreference: 'standard',
    customSlug: 'mai-anh',
    wish: 'Hạnh phúc ngập tràn nhé cô dâu Trần Mỹ Quỳnh xinh đẹp của tụi em!',
    giftAmount: 500000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-18T14:20:00Z',
  },
  {
    id: 'g-3',
    name: 'Bác Nguyễn Văn Hùng',
    relationship: 'Bác họ nhà trai',
    group: 'Nhà trai',
    phone: '0918999888',
    tableNumber: 'Bàn 01 (VIP)',
    status: 'attending',
    attendeesCount: 2,
    dietaryPreference: 'standard',
    customSlug: 'bac-nguyen-van-hung',
    wish: 'Gia đình chúc hai cháu gắn bó bền chặt, yêu thương nhau suốt đời.',
    giftAmount: 2000000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-12T10:15:00Z',
  },
  {
    id: 'g-4',
    name: 'Anh Hoàng Nam & Chị Linh',
    relationship: 'Bạn cấp 3 chú rể',
    group: 'Bạn Chú rể',
    phone: '0977654321',
    tableNumber: 'Bàn 03',
    status: 'attending',
    attendeesCount: 2,
    dietaryPreference: 'standard',
    customSlug: 'hoang-nam-linh',
    wish: 'Cặp đôi hoàn hảo nhất năm! Chúc mừng đôi bạn trẻ nhé.',
    giftAmount: 1000000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-20T16:00:00Z',
  },
  {
    id: 'g-5',
    name: 'Chị Đỗ Thu Hà',
    relationship: 'Bạn thân cô dâu',
    group: 'Bạn Cô dâu',
    phone: '0933221100',
    tableNumber: 'Bàn 06',
    status: 'attending',
    attendeesCount: 1,
    dietaryPreference: 'vegetarian',
    customSlug: 'thu-ha',
    wish: 'Mong tình yêu của hai bạn mãi vĩnh cửu và ngọt ngào như ngày đầu!',
    giftAmount: 1000000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-22T11:45:00Z',
  },
  {
    id: 'g-6',
    name: 'Anh Vũ Đức Trọng',
    relationship: 'Đồng nghiệp cũ',
    group: 'Đồng nghiệp',
    phone: '0944556677',
    status: 'declined',
    attendeesCount: 0,
    dietaryPreference: 'standard',
    customSlug: 'vu-duc-trong',
    wish: 'Rất tiếc hôm đó mình có chuyến công tác xa không về kịp. Chúc hai bạn trăm năm hạnh phúc!',
    giftAmount: 500000,
    invitedViaZalo: true,
    confirmedAt: '2025-10-25T19:10:00Z',
  },
  {
    id: 'g-7',
    name: 'Anh Nguyễn Minh Quang',
    relationship: 'Họ hàng nhà gái',
    group: 'Nhà gái',
    phone: '0988112233',
    status: 'pending',
    attendeesCount: 1,
    dietaryPreference: 'standard',
    customSlug: 'nguyen-minh-quang',
    invitedViaZalo: false,
  },
  {
    id: 'g-8',
    name: 'Chị Phạm Thùy Dung',
    relationship: 'Bạn đại học cô dâu',
    group: 'Bạn Cô dâu',
    phone: '0919334455',
    status: 'pending',
    attendeesCount: 1,
    dietaryPreference: 'standard',
    customSlug: 'thuy-dung',
    invitedViaZalo: true,
  },
];

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
    url: '/assets/aistudio/Carousel-01_62db3fd6.JPG',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 01',
  },
  {
    url: '/assets/aistudio/Carousel-02_509080cc.JPG',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 02',
  },
  {
    url: '/assets/aistudio/Carousel-03_8833b15d.JPG',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 03',
  },
  {
    url: '/assets/aistudio/Carousel-04_08495081.JPG',
    caption: 'Đặng Long Vi & Trần Mỹ Quỳnh',
    category: 'Khoảnh khắc 04',
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
