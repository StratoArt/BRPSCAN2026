/**
 * R2 Scan Dashboard — Google Sheets API
 *
 * Sheets:
 *   RETAILER_MASTER
 *   PRODUCT_MASTER
 *   SCAN_DATA
 *
 * GET  -> returns {retailers, products, scans}
 * POST -> appends a scan to SCAN_DATA
 */

const SHEET_RETAILER = 'RETAILER_MASTER';
const SHEET_PRODUCT = 'PRODUCT_MASTER';
const SHEET_SCAN = 'SCAN_DATA';

function doGet() {
  try {
    return jsonOutput({
      ok: true,
      retailers: sheetToObjects(SHEET_RETAILER),
      products: sheetToObjects(SHEET_PRODUCT),
      scans: sheetToObjects(SHEET_SCAN)
    });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_SCAN);
    if (!sh) throw new Error('Sheet SCAN_DATA tidak ditemukan.');

    const headers = getHeaders(sh);

    // Accept both IDs and common frontend names.
    const retailerId = payload.Retailer_ID ?? payload.retailer_id ?? payload.retailerId;
    const productId  = payload.Product_ID  ?? payload.product_id  ?? payload.productId;
    const qtyBox     = Number(payload.Qty_Box ?? payload.qty_box ?? payload.qtyBox ?? 0);

    if (!retailerId) throw new Error('Retailer_ID wajib diisi.');
    if (!productId) throw new Error('Product_ID wajib diisi.');
    if (!Number.isFinite(qtyBox) || qtyBox <= 0) throw new Error('Qty_Box harus lebih dari 0.');

    // Look up product master so Point/Volume/Value cannot be manipulated by the browser.
    const products = sheetToObjects(SHEET_PRODUCT);
    const product = products.find(p => String(p.Product_ID) === String(productId));
    if (!product) throw new Error('Product_ID tidak ditemukan di PRODUCT_MASTER.');

    const pointPerBox = Number(product.Point_Per_Box || 0);
    const volumePerBox = Number(product.Volume_Per_Box || 0);
    const valuePerBox = Number(product.Value_Per_Box || 0);

    const rowObj = {
      Retailer_ID: String(retailerId),
      Product_ID: String(productId),
      Qty_Box: qtyBox,
      Point: qtyBox * pointPerBox,
      Volume: qtyBox * volumePerBox,
      Value: qtyBox * valuePerBox
    };

    const row = headers.map(h => rowObj[h] !== undefined ? rowObj[h] : '');
    sh.appendRow(row);

    SpreadsheetApp.flush();

    return jsonOutput({
      ok: true,
      message: 'Scan berhasil disimpan.',
      row: rowObj
    });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function getHeaders(sh) {
  const lastCol = sh.getLastColumn();
  if (lastCol < 1) throw new Error('Header SCAN_DATA belum dibuat.');
  return sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
}

function sheetToObjects(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet tidak ditemukan: ' + name);

  const values = sh.getDataRange().getValues();
  if (!values.length) return [];

  const headers = values[0].map(String);
  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
