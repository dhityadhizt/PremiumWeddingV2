// ============================================================================
// GOOGLE APPS SCRIPT - WEDDING INVITATION (RSVP + LIVE PHOTO SHARING PNG)
// ============================================================================

const FOLDER_ID = '10VPVOU3KRLyrHAyxUUFLO67C68ICidWm';
const SHEET_RSVP = 'Ucapan';
const SHEET_GALERI = 'LiveGaleri';

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : 'rsvp';
    if (action === 'gallery') {
      return getGalleryPhotos();
    }
    return getRsvpComments();
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err && err.toString ? err.toString() : String(err)
    });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        status: 'error',
        message: 'Payload POST kosong atau tidak valid.'
      });
    }

    const payload = JSON.parse(e.postData.contents);

    if (payload && payload.action === 'uploadPhoto') {
      return uploadLivePhoto(payload);
    }
    return saveRsvpComment(payload || {});
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err && err.toString ? err.toString() : String(err)
    });
  }
}

function uploadLivePhoto(payload) {
  if (!payload || !payload.image || typeof payload.image !== 'string') {
    return jsonResponse({
      status: 'error',
      message: 'Data gambar tidak ditemukan.'
    });
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);

  const match = payload.image.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
  const mimeType = match ? match[1].toLowerCase() : 'image/png';
  const base64Data = match ? match[2] : payload.image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

  const decodedBytes = Utilities.base64Decode(base64Data);

  const rawGuestName = payload.guestName ? String(payload.guestName) : 'Tamu';
  const guestName = rawGuestName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'Tamu';
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss');
  const ext = mimeType.indexOf('jpeg') !== -1 || mimeType.indexOf('jpg') !== -1 ? 'jpg' : 'png';
  const fileName = 'Wedding_' + guestName.replace(/\s+/g, '_') + '_' + timestamp + '.' + ext;

  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    // Jika kebijakan folder/domain membatasi setSharing, file tetap tersimpan di Drive
  }

  const fileId = file.getId();
  const imageUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=w1200';
  const driveUrl = file.getUrl();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_GALERI);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_GALERI);
    sheet.appendRow(['ID', 'Waktu', 'Nama Tamu', 'Nama File', 'Image URL', 'Drive Link']);
  }

  const photoId = new Date().getTime();
  const formattedDate = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
  sheet.appendRow([photoId, formattedDate, guestName, fileName, imageUrl, driveUrl]);

  return jsonResponse({
    status: 'success',
    photo: {
      id: photoId,
      guestName: guestName,
      image: imageUrl,
      driveUrl: driveUrl,
      date: formattedDate
    }
  });
}

function getGalleryPhotos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GALERI);

  if (!sheet) {
    return jsonResponse({
      status: 'success',
      photos: []
    });
  }

  const rows = sheet.getDataRange().getValues();
  const photos = [];

  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][4]) {
      photos.push({
        id: rows[i][0],
        date: rows[i][1],
        guestName: rows[i][2],
        fileName: rows[i][3],
        image: rows[i][4],
        driveUrl: rows[i][5]
      });
    }
  }

  return jsonResponse({
    status: 'success',
    photos: photos
  });
}

function saveRsvpComment(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RSVP);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RSVP);
    sheet.appendRow(['id', 'name', 'status', 'message', 'date', 'color']);
  }

  sheet.appendRow([
    payload.id || new Date().getTime(),
    payload.name || '',
    payload.status || '',
    payload.message || '',
    payload.date || '',
    payload.color || '#000000'
  ]);

  return jsonResponse({
    status: 'success'
  });
}

function getRsvpComments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RSVP);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  const rows = sheet.getDataRange().getValues();
  const comentar = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1]) {
      comentar.push({
        id: rows[i][0],
        name: rows[i][1],
        status: rows[i][2],
        message: rows[i][3],
        date: rows[i][4],
        color: rows[i][5]
      });
    }
  }

  return jsonResponse({
    comentar: comentar
  });
}
