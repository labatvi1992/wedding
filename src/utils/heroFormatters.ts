import { WeddingConfig } from '../types/wedding';

export interface HeroCeremonyDetails {
  timeLabel: string;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  venueTitle: string;
  addressUpper: string;
}

const VIETNAMESE_WEEKDAYS = [
  'CHỦ NHẬT',
  'THỨ HAI',
  'THỨ BA',
  'THỨ TƯ',
  'THỨ NĂM',
  'THỨ SÁU',
  'THỨ BẢY',
];

/**
 * Formats a HH:mm time string (e.g. "11:00" or "16:30") into "11H00" / "16H30".
 */
export function formatHeroCeremonyTime(weddingTime?: string): string {
  const raw = (weddingTime || '11:00').trim();
  const match = raw.match(/^(\d{1,2})\s*[:hH]\s*(\d{2})$/);
  if (match) {
    return `${match[1].padStart(2, '0')}H${match[2]}`;
  }
  return raw.toUpperCase();
}

/**
 * Computes the Vietnamese uppercase weekday name from an ISO date string (YYYY-MM-DD).
 */
export function getVietnameseWeekday(isoDate?: string): string {
  if (!isoDate) return 'CHỦ NHẬT';
  const parts = isoDate.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const [year, month, day] = parts;
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    if (!isNaN(utcDate.getTime())) {
      return VIETNAMESE_WEEKDAYS[utcDate.getUTCDay()] || 'CHỦ NHẬT';
    }
  }
  return 'CHỦ NHẬT';
}

/**
 * Extracts a clean 4-digit year from ceremonyYear (e.g. "NĂM 2026") or weddingDate ("2026-12-20").
 */
export function extractHeroYear(ceremonyYear?: string, weddingDate?: string): string {
  const yearFromText = ceremonyYear?.match(/\d{4}/)?.[0];
  if (yearFromText) return yearFromText;
  const yearFromDate = weddingDate?.match(/^(\d{4})/)?.[1];
  if (yearFromDate) return yearFromDate;
  return '2026';
}

/**
 * Formats ceremony details from WeddingConfig for the Hero wedding poster layout.
 */
export function formatHeroCeremonyDetails(config: WeddingConfig): HeroCeremonyDetails {
  const dayNum = config.ceremonyDay || 20;
  const dayLabel = String(dayNum).padStart(2, '0');
  const monthLabel = (config.ceremonyMonth || 'THÁNG 12').trim().toUpperCase();
  const yearLabel = extractHeroYear(config.ceremonyYear, config.weddingDate);
  const weekdayLabel = getVietnameseWeekday(config.weddingDate);
  const timeLabel = formatHeroCeremonyTime(config.weddingTime);
  const venueTitle = config.venueName?.trim()
    ? `Tại ${config.venueName.trim()}`
    : 'Tại Nhà Hàng Tiệc Cưới';
  const addressUpper = (config.venueAddress || '').trim().toUpperCase();

  return {
    timeLabel,
    weekdayLabel,
    dayLabel,
    monthLabel,
    yearLabel,
    venueTitle,
    addressUpper,
  };
}

/**
 * Resolves the guest display name for the hero invitation line,
 * defaulting to "Quý khách" when no personalized guest name is provided.
 */
export function resolveHeroGuestName(guestName?: string | null): string {
  const trimmed = guestName?.trim();
  return trimmed ? trimmed : 'Quý khách';
}
