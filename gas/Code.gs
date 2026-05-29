// ==========================================
// CAFE POS — Google Apps Script Backend
// ==========================================
// วิธีใช้:
// 1. เปิด script.google.com → สร้างโปรเจกต์ใหม่
// 2. วาง code นี้ทับ code เดิม
// 3. แก้ SS_ID ให้ตรงกับ Google Sheet ของคุณ
// 4. Deploy → New deployment → Web app
//    Execute as: Me | Who has access: Anyone
// 5. คัดลอก URL ไปใส่ใน .env.local เป็น NEXT_PUBLIC_GAS_URL

var SS_ID = '1rq45ndKFd9d5KfMpoai2AeipBesaJQ2tCsCBKWdYjYY';

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// doGet — read operations
// ==========================================
function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'getProducts') return getProducts();
    if (action === 'getOrders')   return getOrders();
    if (action === 'getReport')   return getReport(e.parameter.date);
    return jsonErr('Unknown action: ' + action);
  } catch (err) {
    return jsonErr(err.message);
  }
}

// ==========================================
// doPost — write operations
// ==========================================
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === 'saveOrder')     return saveOrder(body.payload);
    if (action === 'updateProduct') return updateProduct(body.payload);
    if (action === 'updateStock')   return updateStock(body.id, body.delta);
    return jsonErr('Unknown action: ' + action);
  } catch (err) {
    return jsonErr(err.message);
  }
}

// ==========================================
// Products
// ==========================================
function getProducts() {
  var sheet = getSheet('Products');
  var rows = sheet.getDataRange().getValues();
  var products = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue; // skip empty rows
    products.push({
      id:        String(r[0]),
      name:      String(r[1]),
      category:  String(r[2]),
      price:     Number(r[3]),
      costPrice: Number(r[4]),
      stock:     Number(r[5]),
      unit:      String(r[6]),
      available: String(r[7]).toUpperCase() === 'TRUE'
    });
  }
  return jsonOk(products);
}

function updateProduct(product) {
  var sheet = getSheet('Products');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(product.id)) {
      var row = i + 1;
      sheet.getRange(row, 1, 1, 8).setValues([[
        product.id,
        product.name,
        product.category,
        product.price,
        product.costPrice,
        product.stock,
        product.unit,
        product.available ? 'TRUE' : 'FALSE'
      ]]);
      return jsonOk({ updated: product.id });
    }
  }
  // Not found — append new product
  sheet.appendRow([
    product.id,
    product.name,
    product.category,
    product.price,
    product.costPrice,
    product.stock,
    product.unit,
    product.available ? 'TRUE' : 'FALSE'
  ]);
  return jsonOk({ created: product.id });
}

function updateStock(id, delta) {
  var sheet = getSheet('Products');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      var currentStock = Number(rows[i][5]);
      if (currentStock < 0) return jsonOk({ id: id, stock: currentStock }); // unlimited
      var newStock = Math.max(0, currentStock + delta);
      sheet.getRange(i + 1, 6).setValue(newStock);
      return jsonOk({ id: id, stock: newStock });
    }
  }
  return jsonErr('Product not found: ' + id);
}

// ==========================================
// Orders
// ==========================================
function saveOrder(order) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Append order row
    var sheet = getSheet('Orders');
    sheet.appendRow([
      order.id,
      order.date,
      order.itemsSummary,
      order.total,
      order.totalCost,
      order.profit,
      order.paymentMethod,
      order.amountPaid,
      order.change
    ]);

    // Decrement stock for each item
    var items = order.items || [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.productId) {
        updateStockInternal(item.productId, -item.quantity);
      }
    }

    return jsonOk({ saved: order.id });
  } finally {
    lock.releaseLock();
  }
}

function updateStockInternal(id, delta) {
  var sheet = getSheet('Products');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      var currentStock = Number(rows[i][5]);
      if (currentStock < 0) return; // unlimited (-1)
      var newStock = Math.max(0, currentStock + delta);
      sheet.getRange(i + 1, 6).setValue(newStock);
      return;
    }
  }
}

function getOrders() {
  var sheet = getSheet('Orders');
  var rows = sheet.getDataRange().getValues();
  var orders = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    orders.push({
      id:            String(r[0]),
      date:          String(r[1]),
      itemsSummary:  String(r[2]),
      total:         Number(r[3]),
      totalCost:     Number(r[4]),
      profit:        Number(r[5]),
      paymentMethod: String(r[6]),
      amountPaid:    Number(r[7]),
      change:        Number(r[8])
    });
  }
  return jsonOk(orders);
}

function getReport(dateStr) {
  var sheet = getSheet('Orders');
  var rows = sheet.getDataRange().getValues();
  var today = dateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var orders = [];
  var totalRevenue = 0;
  var totalCost = 0;

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var rowDate = String(r[1]).substring(0, 10); // "2026-05-29 14:30" → "2026-05-29"
    if (rowDate === today) {
      var order = {
        id:            String(r[0]),
        date:          String(r[1]),
        itemsSummary:  String(r[2]),
        total:         Number(r[3]),
        totalCost:     Number(r[4]),
        profit:        Number(r[5]),
        paymentMethod: String(r[6]),
        amountPaid:    Number(r[7]),
        change:        Number(r[8])
      };
      orders.push(order);
      totalRevenue += order.total;
      totalCost += order.totalCost;
    }
  }

  return jsonOk({
    date:         today,
    orderCount:   orders.length,
    totalRevenue: totalRevenue,
    totalCost:    totalCost,
    netProfit:    totalRevenue - totalCost,
    orders:       orders
  });
}

// ==========================================
// Setup helper — สร้าง Sheet headers ครั้งแรก
// Run this function once manually after creating the spreadsheet
// ==========================================
function setupSheets() {
  var ss = SpreadsheetApp.openById(SS_ID);

  var productsSheet = ss.getSheetByName('Products') || ss.insertSheet('Products');
  productsSheet.getRange(1, 1, 1, 8).setValues([[
    'id', 'name', 'category', 'price', 'costPrice', 'stock', 'unit', 'available'
  ]]);
  productsSheet.getRange(1, 1, 1, 8).setFontWeight('bold');

  var ordersSheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
  ordersSheet.getRange(1, 1, 1, 9).setValues([[
    'id', 'date', 'itemsSummary', 'total', 'totalCost', 'profit', 'paymentMethod', 'amountPaid', 'change'
  ]]);
  ordersSheet.getRange(1, 1, 1, 9).setFontWeight('bold');

  // Sample products data
  var sampleProducts = [
    ['P001', 'ชาไทย', 'ชา', 35, 12, 50, 'แก้ว', 'TRUE'],
    ['P002', 'ชามะนาว', 'ชา', 30, 10, 50, 'แก้ว', 'TRUE'],
    ['P003', 'กาแฟเย็น', 'กาแฟ', 40, 15, 30, 'แก้ว', 'TRUE'],
    ['P004', 'โอเลี้ยง', 'กาแฟ', 30, 10, 30, 'แก้ว', 'TRUE'],
    ['P005', 'น้ำส้มคั้น', 'น้ำผลไม้', 45, 20, 20, 'แก้ว', 'TRUE'],
    ['P006', 'โซดาซิตรัส', 'โซดา', 35, 12, 40, 'แก้ว', 'TRUE'],
    ['P007', 'โซดาสตรอว์เบอร์รี', 'โซดา', 35, 12, 40, 'แก้ว', 'TRUE'],
    ['P008', 'ไอติมวานิลลา', 'ไอติม', 25, 10, 20, 'ถ้วย', 'TRUE'],
  ];
  productsSheet.getRange(2, 1, sampleProducts.length, 8).setValues(sampleProducts);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}
