import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatHeroCeremonyTime,
  getVietnameseWeekday,
  extractHeroYear,
  formatHeroCeremonyDetails,
  resolveHeroGuestName,
} from './heroFormatters';
import { INITIAL_WEDDING_CONFIG } from '../data/initialData';

test('formatHeroCeremonyTime converts HH:mm to HHhMM uppercase format', () => {
  assert.equal(formatHeroCeremonyTime('11:00'), '11H00');
  assert.equal(formatHeroCeremonyTime('16:30'), '16H30');
  assert.equal(formatHeroCeremonyTime('9:05'), '09H05');
});

test('getVietnameseWeekday returns accurate Vietnamese weekday for ISO date', () => {
  assert.equal(getVietnameseWeekday('2026-12-20'), 'CHỦ NHẬT');
  assert.equal(getVietnameseWeekday('2022-10-28'), 'THỨ SÁU');
  assert.equal(getVietnameseWeekday('2026-12-21'), 'THỨ HAI');
});

test('extractHeroYear extracts 4-digit year from ceremonyYear or weddingDate', () => {
  assert.equal(extractHeroYear('NĂM 2026', '2026-12-20'), '2026');
  assert.equal(extractHeroYear(undefined, '2027-05-10'), '2027');
});

test('formatHeroCeremonyDetails formats INITIAL_WEDDING_CONFIG accurately', () => {
  const details = formatHeroCeremonyDetails(INITIAL_WEDDING_CONFIG);
  assert.equal(details.timeLabel, '11H00');
  assert.equal(details.weekdayLabel, 'CHỦ NHẬT');
  assert.equal(details.dayLabel, '20');
  assert.equal(details.monthLabel, 'THÁNG 12');
  assert.equal(details.yearLabel, '2026');
  assert.ok(details.venueTitle.includes('Ngọc Bích Palace'));
  assert.ok(details.addressUpper.includes('GIA LAI'));
});

test('resolveHeroGuestName defaults to Quý khách when guest name is empty or whitespace', () => {
  assert.equal(resolveHeroGuestName(undefined), 'Quý khách');
  assert.equal(resolveHeroGuestName(null), 'Quý khách');
  assert.equal(resolveHeroGuestName(''), 'Quý khách');
  assert.equal(resolveHeroGuestName('   '), 'Quý khách');
  assert.equal(resolveHeroGuestName('  Anh Quốc Bảo  '), 'Anh Quốc Bảo');
});
