import { Guest, WeddingConfig } from '../types/wedding';
import { GOOGLE_SHEET_WEB_APP_URL } from '../data/initialData';

export interface SheetRowPayload {
  STT: number;
  'Họ tên': string;
  'Bình chọn': 'Sẽ tham dự' | 'Bận không tới được' | '';
  'Số lượng': number;
}

/**
 * Resolves the active Google Sheet Web App URL strictly from GOOGLE_SHEET_WEB_APP_URL env var
 * (or config if synced from env). Returns empty string when not configured.
 */
export function resolveGoogleSheetWebhookUrl(config?: WeddingConfig): string {
  if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.trim()) {
    return GOOGLE_SHEET_WEB_APP_URL.trim();
  }
  if (config?.googleSheetWebAppUrl && config.googleSheetWebAppUrl.trim()) {
    return config.googleSheetWebAppUrl.trim();
  }
  return '';
}

/**
 * Maps RSVP submission data to the exact 4 columns of "Danh sách mời cưới":
 * STT (tự tăng) | Họ tên | Bình chọn | Số lượng
 */
export function buildSheetRowPayload(params: {
  stt: number;
  name: string;
  status: 'attending' | 'declined' | 'pending';
  attendeesCount: number;
}): SheetRowPayload {
  const cleanName = params.name.trim();
  let voteLabel: 'Sẽ tham dự' | 'Bận không tới được' | '' = '';
  let count = 0;

  if (params.status === 'attending') {
    voteLabel = 'Sẽ tham dự';
    count = Math.max(1, Number(params.attendeesCount) || 1);
  } else if (params.status === 'declined') {
    voteLabel = 'Bận không tới được';
    count = 0;
  } else {
    voteLabel = '';
    count = 0;
  }

  return {
    STT: params.stt,
    'Họ tên': cleanName,
    'Bình chọn': voteLabel,
    'Số lượng': count,
  };
}

/**
 * Submits a row to the connected Google Sheet ("Danh sách mời cưới") via GOOGLE_SHEET_WEB_APP_URL.
 * If GOOGLE_SHEET_WEB_APP_URL is not configured, returns false immediately and does not save.
 */
export async function submitRowToGoogleSheet(
  webhookUrl: string,
  payload: SheetRowPayload
): Promise<boolean> {
  const trimmedUrl = webhookUrl.trim();
  if (!trimmedUrl) return false;

  try {
    const urlObj = new URL(trimmedUrl);
    urlObj.searchParams.set('stt', String(payload.STT));
    urlObj.searchParams.set('hoTen', payload['Họ tên']);
    urlObj.searchParams.set('binhChon', payload['Bình chọn']);
    urlObj.searchParams.set('vote', payload['Bình chọn']);
    urlObj.searchParams.set('soLuong', String(payload['Số lượng']));

    await fetch(urlObj.toString(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses a CSV line respecting quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Fetches and synchronizes guest rows (STT, Họ tên, Vote, Số lượng) from GOOGLE_SHEET_WEB_APP_URL.
 * Supports both Google Apps Script Web App JSON/CSV responses and direct Google Sheets links.
 */
export async function fetchGuestsFromGoogleSheet(sheetUrl: string): Promise<Guest[] | null> {
  const trimmed = sheetUrl.trim();
  if (!trimmed) return null;

  try {
    let fetchTarget = trimmed;
    const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetIdMatch && sheetIdMatch[1]) {
      fetchTarget = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/gviz/tq?tqx=out:csv`;
    }

    const response = await fetch(fetchTarget, {
      method: 'GET',
      headers: { Accept: 'application/json, text/csv, text/plain, */*' },
    });

    if (!response.ok) return null;

    const text = await response.text();
    if (!text.trim()) return [];

    // 1. Try parsing as JSON (from Google Apps Script doGet)
    try {
      const json = JSON.parse(text);
      const rawRows: Record<string, unknown>[] = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.rows)
        ? json.rows
        : [];

      if (rawRows.length > 0) {
        return rawRows
          .map((item, idx): Guest | null => {
            const nameVal = String(
              item['Họ tên'] ?? item.hoTen ?? item.name ?? item['Ho ten'] ?? ''
            ).trim();
            if (!nameVal || nameVal.toLowerCase() === 'họ tên') return null;

            const voteRaw = String(
              item['Bình chọn'] ?? item.binhChon ?? item['Vote'] ?? item.vote ?? item.status ?? ''
            ).trim();
            const countRaw = Number(
              item['Số lượng'] ?? item.soLuong ?? item.attendeesCount ?? 0
            );

            const isDeclined =
              voteRaw.toLowerCase().includes('bận') ||
              voteRaw.toLowerCase().includes('không') ||
              voteRaw.toLowerCase() === 'declined';
            const isPending =
              !voteRaw ||
              voteRaw.toLowerCase().includes('chưa') ||
              voteRaw.toLowerCase() === 'pending';

            const status: Guest['status'] = isDeclined
              ? 'declined'
              : isPending
              ? 'pending'
              : 'attending';

            return {
              id: `sheet-${item['STT'] ?? item.stt ?? idx + 1}-${encodeURIComponent(nameVal)}`,
              name: nameVal,
              relationship: 'Khách quý',
              group: 'Bạn Chú rể',
              phone: '',
              status,
              attendeesCount: isDeclined || isPending ? 0 : (isNaN(countRaw) ? 1 : countRaw),
              customSlug: encodeURIComponent(nameVal),
            };
          })
          .filter((g): g is Guest => g !== null);
      }
    } catch {
      // Fall through to CSV parser
    }

    // 2. Parse as CSV (STT,Họ tên,Bình chọn,Số lượng)
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length <= 1) return [];

    const parsedGuests: Guest[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const nameVal = (cols[1] || cols[0] || '').trim();
      if (!nameVal || nameVal.toLowerCase() === 'họ tên') continue;

      const voteRaw = (cols[2] || '').trim();
      const countRaw = Number(cols[3] ?? 0);
      const isDeclined =
        voteRaw.toLowerCase().includes('bận') || voteRaw.toLowerCase().includes('không');
      const isPending = !voteRaw || voteRaw.toLowerCase().includes('chưa');

      parsedGuests.push({
        id: `sheet-${cols[0] || i}-${encodeURIComponent(nameVal)}`,
        name: nameVal,
        relationship: 'Khách quý',
        group: 'Bạn Chú rể',
        phone: '',
        status: isDeclined ? 'declined' : isPending ? 'pending' : 'attending',
        attendeesCount: isDeclined || isPending ? 0 : (isNaN(countRaw) ? 1 : countRaw),
        customSlug: encodeURIComponent(nameVal),
      });
    }

    return parsedGuests;
  } catch {
    return null;
  }
}
