import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSheetRowPayload,
  resolveGoogleSheetWebhookUrl,
  submitRowToGoogleSheet,
} from './googleSheetSync';
import { INITIAL_WEDDING_CONFIG } from '../data/initialData';

test('buildSheetRowPayload correctly structures 4-column payload with Bình chọn', () => {
  const payloadAttending = buildSheetRowPayload({
    stt: 1,
    name: '  Nguyễn Văn A  ',
    status: 'attending',
    attendeesCount: 2,
  });

  assert.equal(payloadAttending.STT, 1);
  assert.equal(payloadAttending['Họ tên'], 'Nguyễn Văn A');
  assert.equal(payloadAttending['Bình chọn'], 'Sẽ tham dự');
  assert.equal(payloadAttending['Số lượng'], 2);

  const payloadDeclined = buildSheetRowPayload({
    stt: 2,
    name: 'Trần Thị B',
    status: 'declined',
    attendeesCount: 3, // When declined, attendeesCount is clamped to 0
  });

  assert.equal(payloadDeclined.STT, 2);
  assert.equal(payloadDeclined['Họ tên'], 'Trần Thị B');
  assert.equal(payloadDeclined['Bình chọn'], 'Bận không tới được');
  assert.equal(payloadDeclined['Số lượng'], 0);
});

test('resolveGoogleSheetWebhookUrl returns string from config or fallback', () => {
  const url = resolveGoogleSheetWebhookUrl(INITIAL_WEDDING_CONFIG);
  assert.equal(typeof url, 'string');
});

test('submitRowToGoogleSheet safely returns false when URL is empty', async () => {
  const payload = buildSheetRowPayload({
    stt: 1,
    name: 'Test',
    status: 'attending',
    attendeesCount: 1,
  });

  const ok = await submitRowToGoogleSheet('', payload);
  assert.equal(ok, false);
});
