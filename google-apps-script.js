/**
 * GOOGLE APPS SCRIPT CHO THIỆP CƯỚI (ĐỒNG BỘ XÁC NHẬN THAM DỰ)
 * 
 * Hướng dẫn cài đặt trên Google Sheet:
 * 1. Mở trang tính Google Sheet của bạn (https://sheets.google.com).
 * 2. Đổi tên tab sheet đầu tiên thành "Danh sách mời cưới" (hoặc script sẽ tự lấy tab đầu tiên).
 * 3. Vào menu "Tiện ích mở rộng" (Extensions) > chọn "Apps Script".
 * 4. Xoá mã mặc định và dán toàn bộ nội dung file này vào tệp Code.gs.
 * 5. Bấm icon Lưu (Ctrl+S / Cmd+S).
 * 6. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải > chọn "Quản lý bản triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "Đồng bộ thiệp cưới".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me - tài khoản Google của bạn).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) - QUAN TRỌNG: để khách mời không cần đăng nhập Google vẫn gửi được.
 * 7. Bấm "Triển khai" và Cấp quyền truy cập nếu Google hỏi.
 * 8. Copy "URL ứng dụng web" (kết thúc bằng /exec) và dán vào biến GOOGLE_SHEET_WEB_APP_URL trong file .env của dự án.
 */

const SHEET_NAME = 'Danh sách mời cưới';

function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  // Khởi tạo tiêu đề 4 cột chuẩn nếu sheet còn trống
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['STT', 'Họ tên', 'Bình chọn', 'Số lượng']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#f3f4f6');
  }
  return sheet;
}

// 1. GET: Trả về danh sách khách mời để đồng bộ hiển thị lên trang web
function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, total: 0, data: [] });
    }

    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // Bỏ qua nếu thiếu họ tên
      const voteValue = row[2] !== undefined && row[2] !== null ? String(row[2]).trim() : '';
      rows.push({
        STT: row[0] || i,
        'Họ tên': String(row[1]).trim(),
        'Bình chọn': voteValue,
        binhChon: voteValue,     // camelCase alias
        Vote: voteValue,         // Alias tương thích ngược
        'Số lượng': Number(row[3]) || 0
      });
    }

    return jsonResponse({ success: true, total: rows.length, data: rows });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// 2. POST: Cập nhật (Upsert) xác nhận tham dự của khách mời
function doPost(e) {
  try {
    const sheet = getTargetSheet();
    let payload = {};

    // Hỗ trợ đọc cả JSON body và query parameters
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (ex) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const hoTen = String(payload.hoTen || payload['Họ tên'] || payload.name || '').trim();
    if (!hoTen) {
      return jsonResponse({ success: false, message: 'Thiếu thông tin họ tên khách mời' });
    }

    // Nhận "Bình chọn" / binhChon (hỗ trợ chuỗi rỗng khi tạo khách mới)
    let binhChon = '';
    if (payload['Bình chọn'] !== undefined) {
      binhChon = String(payload['Bình chọn']).trim();
    } else if (payload.binhChon !== undefined) {
      binhChon = String(payload.binhChon).trim();
    } else if (payload.vote !== undefined || payload.Vote !== undefined) {
      binhChon = String(payload.vote || payload.Vote).trim();
    } else if (payload.status === 'declined') {
      binhChon = 'Bận không tới được';
    } else if (payload.status === 'attending') {
      binhChon = 'Sẽ tham dự';
    } else {
      binhChon = '';
    }

    // Nhận "Số lượng": nếu rỗng/chưa xác nhận hoặc bận thì để 0
    let soLuong = 0;
    const rawCount = payload['Số lượng'] !== undefined ? payload['Số lượng'] :
      (payload.soLuong !== undefined ? payload.soLuong : payload.attendeesCount);
    if (rawCount !== undefined && rawCount !== null && !isNaN(Number(rawCount))) {
      soLuong = Math.max(0, Number(rawCount));
    } else if (binhChon === 'Sẽ tham dự') {
      soLuong = 1;
    } else {
      soLuong = 0;
    }

    const data = sheet.getDataRange().getValues();
    let rowIndexToUpdate = -1;
    let maxStt = 0;

    // Tìm kiếm xem họ tên đã tồn tại chưa (so khớp không phân biệt hoa thường)
    const normalizedTargetName = hoTen.toLowerCase();
    for (let i = 1; i < data.length; i++) {
      const currentStt = Number(data[i][0]);
      if (!isNaN(currentStt) && currentStt > maxStt) {
        maxStt = currentStt;
      }
      const currentName = String(data[i][1] || '').trim().toLowerCase();
      if (currentName === normalizedTargetName) {
        rowIndexToUpdate = i + 1; // 1-based index của hàng trong Google Sheet
        break;
      }
    }

    if (rowIndexToUpdate > 0) {
      // ĐÃ TỒN TẠI -> Cập nhật in-place tại dòng rowIndexToUpdate (Cột C: Bình chọn, Cột D: Số lượng)
      sheet.getRange(rowIndexToUpdate, 3).setValue(binhChon); // Cột C: Bình chọn
      sheet.getRange(rowIndexToUpdate, 4).setValue(soLuong);  // Cột D: Số lượng

      const existingStt = sheet.getRange(rowIndexToUpdate, 1).getValue() || rowIndexToUpdate - 1;

      return jsonResponse({
        success: true,
        action: 'updated',
        row: rowIndexToUpdate,
        data: { STT: existingStt, hoTen, 'Bình chọn': binhChon, binhChon, soLuong }
      });
    } else {
      // CHƯA TỒN TẠI -> Thêm dòng mới 4 cột vào cuối bảng tính
      const newStt = maxStt + 1;
      sheet.appendRow([newStt, hoTen, binhChon, soLuong]);

      return jsonResponse({
        success: true,
        action: 'inserted',
        stt: newStt,
        data: { STT: newStt, hoTen, 'Bình chọn': binhChon, binhChon, soLuong }
      });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
