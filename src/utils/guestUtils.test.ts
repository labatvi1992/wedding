import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGuestStats,
  generateZaloRSVPMessage,
  generateZaloInviteMessage,
  filterGuests,
  formatCurrency,
  calculateCountdown,
  formatGoogleSheetRow,
} from './guestUtils';
import { Guest } from '../types/wedding';

test('calculateGuestStats accurately aggregates guest counts and attendees', () => {
  const mockGuests: Guest[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      relationship: 'Bạn chú rể',
      group: 'Bạn Chú rể',
      phone: '0901234567',
      status: 'attending',
      attendeesCount: 2,
      giftAmount: 1000000,
    },
    {
      id: '2',
      name: 'Trần Thị B',
      relationship: 'Đồng nghiệp',
      group: 'Đồng nghiệp',
      phone: '0912345678',
      status: 'attending',
      attendeesCount: 1,
      giftAmount: 500000,
    },
    {
      id: '3',
      name: 'Lê Văn C',
      relationship: 'Họ hàng',
      group: 'Nhà gái',
      phone: '0987654321',
      status: 'declined',
      attendeesCount: 0,
      giftAmount: 0,
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      relationship: 'Bạn cấp 3',
      group: 'Bạn Chú rể',
      phone: '0933445566',
      status: 'pending',
      attendeesCount: 1,
    },
  ];

  const stats = calculateGuestStats(mockGuests);
  assert.equal(stats.totalInvited, 4);
  assert.equal(stats.totalConfirmedGuests, 2);
  assert.equal(stats.totalActualAttendees, 3); // 2 + 1
  assert.equal(stats.totalDeclined, 1);
  assert.equal(stats.totalPending, 1);
  assert.equal(stats.totalGiftAmount, 1500000);
});

test('generateZaloRSVPMessage generates accurate message for attending guests', () => {
  const msg = generateZaloRSVPMessage({
    guestName: 'Nguyễn Văn An',
    phone: '0909123456',
    status: 'attending',
    attendeesCount: 2,
    wish: 'Chúc hai bạn trăm năm hạnh phúc!',
    groomName: 'Long Vi',
    brideName: 'Mỹ Quỳnh',
    weddingDate: '20/12/2026',
  });

  assert.ok(msg.includes('Nguyễn Văn An'));
  assert.ok(msg.includes('LONG VI & MỸ QUỲNH'));
  assert.ok(msg.includes('CHẮC CHẮN SẼ THAM DỰ'));
  assert.ok(msg.includes('2 người'));
  assert.ok(msg.includes('Chúc hai bạn trăm năm hạnh phúc!'));
});

test('generateZaloRSVPMessage generates polite decline message', () => {
  const msg = generateZaloRSVPMessage({
    guestName: 'Lê Minh',
    phone: '0908888999',
    status: 'declined',
    attendeesCount: 0,
    wish: 'Rất tiếc mình không thể đến được, chúc hai bạn viên mãn!',
    groomName: 'Thanh Huy',
    brideName: 'Phương Thúy',
    weddingDate: '16/11/2025',
  });

  assert.ok(msg.includes('Lê Minh'));
  assert.ok(msg.includes('Rất tiếc không thể tham dự'));
  assert.ok(msg.includes('Rất tiếc mình không thể đến được'));
});

test('generateZaloInviteMessage creates formal invitation with URL', () => {
  const msg = generateZaloInviteMessage({
    guestName: 'Anh Tuấn',
    groomName: 'Thanh Huy',
    brideName: 'Phương Thúy',
    weddingDate: '16.11.2025',
    weddingTime: '18:00',
    venueName: 'White Palace',
    venueAddress: '108 Phạm Văn Đồng, TP.HCM',
    invitationUrl: 'https://wedding.example.com?guest=Anh+Tuan',
  });

  assert.ok(msg.includes('ANH TUẤN'));
  assert.ok(msg.includes('Thanh Huy'));
  assert.ok(msg.includes('Phương Thúy'));
  assert.ok(msg.includes('https://wedding.example.com?guest=Anh+Tuan'));
});

test('filterGuests correctly filters by search, group and status', () => {
  const guests: Guest[] = [
    { id: '1', name: 'Đặng Tuấn Anh', phone: '0901111111', relationship: 'Bạn thân', group: 'Bạn Chú rể', status: 'attending', attendeesCount: 1 },
    { id: '2', name: 'Trần Bích Thủy', phone: '0902222222', relationship: 'Đồng nghiệp', group: 'Đồng nghiệp', status: 'pending', attendeesCount: 1 },
    { id: '3', name: 'Lê Hoàng Nam', phone: '0903333333', relationship: 'Bạn đại học', group: 'Bạn Chú rể', status: 'declined', attendeesCount: 0 },
  ];

  // Search by name
  const filtered1 = filterGuests(guests, 'Tuấn Anh', 'all', 'all');
  assert.equal(filtered1.length, 1);
  assert.equal(filtered1[0].name, 'Đặng Tuấn Anh');

  // Filter by group
  const filtered2 = filterGuests(guests, '', 'Bạn Chú rể', 'all');
  assert.equal(filtered2.length, 2);

  // Filter by status
  const filtered3 = filterGuests(guests, '', 'all', 'attending');
  assert.equal(filtered3.length, 1);
  assert.equal(filtered3[0].id, '1');
});

test('calculateCountdown calculates days accurately for future dates', () => {
  const target = '2026-11-16T18:00:00';
  const fromDate = new Date('2026-11-10T18:00:00');
  const res = calculateCountdown(target, fromDate);
  assert.equal(res.days, 6);
  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 0);
  assert.equal(res.seconds, 0);
  assert.equal(res.isPast, false);
});

test('calculateCountdown clamps all units to 0 on or after target date', () => {
  // Exact start of wedding day (local time)
  const onExactDay = calculateCountdown('2026-12-20', new Date(2026, 11, 20, 0, 0, 0));
  assert.deepEqual(onExactDay, { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

  // Later during the wedding day
  const duringDay = calculateCountdown('2026-12-20', new Date(2026, 11, 20, 15, 30, 45));
  assert.deepEqual(duringDay, { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

  // Days after the wedding day (must not roll forward to next year)
  const afterDay = calculateCountdown('2026-12-20', new Date(2026, 11, 25, 9, 0, 0));
  assert.deepEqual(afterDay, { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

  // Next year after the wedding day
  const nextYear = calculateCountdown('2026-12-20', new Date(2027, 5, 1, 12, 0, 0));
  assert.deepEqual(nextYear, { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

  // Invalid date input safely clamps to 0
  const invalid = calculateCountdown('invalid-date', new Date(2026, 11, 1, 0, 0, 0));
  assert.deepEqual(invalid, { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
});

test('formatGoogleSheetRow correctly structures data for Google Sheets sync', () => {
  const row = formatGoogleSheetRow({
    timestamp: '2026-11-09 10:30:00',
    name: 'Nguyễn Văn Nam',
    phone: '0901234567',
    group: 'Bạn Chú rể',
    status: 'attending',
    attendeesCount: 2,
    dietaryPreference: 'Ăn chay',
    wish: 'Chúc mừng hai bạn!',
  });

  assert.equal(row[0], '2026-11-09 10:30:00');
  assert.equal(row[1], 'Nguyễn Văn Nam');
  assert.equal(row[2], '0901234567');
  assert.equal(row[3], 'Bạn Chú rể');
  assert.equal(row[4], 'Tham gia');
  assert.equal(row[5], '2');
  assert.equal(row[6], 'Ăn chay');
  assert.equal(row[7], 'Chúc mừng hai bạn!');
});
