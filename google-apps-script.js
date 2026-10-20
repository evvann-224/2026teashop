/**
 * =========================================================================
 * 2026手搖飲點餐記錄 - Google Apps Script 部署程式碼
 * =========================================================================
 * 
 * 【部署步驟說明】
 * 1. 打開 Google 雲端硬碟 (Google Drive)，建立一個新的 Google 試算表 (Google Sheet)。
 * 2. 將試算表名稱重新命名為：2026手搖飲點餐記錄
 * 3. 點擊試算表上方選單「擴充功能」 -> 「Apps Script」。
 * 4. 將本檔案的所有程式碼完整複製並覆蓋取代 Code.gs 內的所有內容。
 * 5. 點擊右上角「部署」按鈕 -> 選擇「新建部署」。
 * 6. 點擊左側齒輪「選取類型」 -> 選擇「網頁應用程式 (Web App)」。
 * 7. 設定如下：
 *    - 說明：2026手搖飲點餐系統 API
 *    - 誰可以存取 (Who has access)：所有人 (Anyone)  <-- 非常重要！請務必選「所有人」
 *    - 執行身分 (Execute as)：我 (Me)
 * 8. 點擊「部署」，授權 Google 帳號權限（若跳出未通過驗證提示，點「進階」->「前往... (不安全)」）。
 * 9. 複製產生的「網頁應用程式網址 (Web App URL)」，貼入前端網頁的 API 設定中即可！
 */

const SHEET_NAME = "2026手搖飲點餐記錄";
const HEADERS = [
  "時間戳記",
  "訂購姓名",
  "飲料品項",
  "規格大小",
  "溫度冰塊",
  "甜度",
  "加料與客製",
  "數量",
  "單價",
  "總金額",
  "備註說明"
];

/**
 * 取得或初始化試算表工作表
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // 若找不到指定工作表，若預設工作表為空則更名，否則新建
    sheet = ss.getActiveSheet();
    if (sheet.getName() === "工作表1" || sheet.getName() === "Sheet1") {
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // 檢查是否有第一列標題列，若無則填上
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // 美化標題列格式
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#3A2E2B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * 處理 POST 請求 (新增點餐紀錄)
 */
function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var payload;

    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter;
      }
    } else if (e.parameter) {
      payload = e.parameter;
    } else {
      payload = {};
    }

    // 支援單筆或多筆 (批次) 傳入
    var items = [];
    if (Array.isArray(payload)) {
      items = payload;
    } else if (Array.isArray(payload.items)) {
      items = payload.items;
      // 將頂層姓名與備註代入各品項（若品項未帶）
      for (var i = 0; i < items.length; i++) {
        if (!items[i].customerName && payload.customerName) {
          items[i].customerName = payload.customerName;
        }
      }
    } else {
      items = [payload];
    }

    var now = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd HH:mm:ss");
    var insertedRows = [];

    items.forEach(function(item) {
      var row = [
        item.timestamp || now,
        item.customerName || "未知",
        item.drinkName || "",
        item.size || "",
        item.ice || "",
        item.sweetness || "",
        item.toppings || "無",
        Number(item.quantity || 1),
        Number(item.unitPrice || 0),
        Number(item.totalPrice || 0),
        item.note || ""
      ];
      sheet.appendRow(row);
      insertedRows.push(row);
    });

    return createJsonResponse({
      status: "success",
      message: "成功存入 " + insertedRows.length + " 筆訂單資料至 Google Sheet！",
      count: insertedRows.length,
      data: insertedRows
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * 處理 GET 請求 (查詢現有所有點餐狀況)
 */
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow <= 1) {
      return createJsonResponse({
        status: "success",
        count: 0,
        data: []
      });
    }

    var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var orders = values.map(function(row, index) {
      return {
        id: index + 1,
        timestamp: row[0],
        customerName: row[1],
        drinkName: row[2],
        size: row[3],
        ice: row[4],
        sweetness: row[5],
        toppings: row[6],
        quantity: row[7],
        unitPrice: row[8],
        totalPrice: row[9],
        note: row[10]
      };
    });

    return createJsonResponse({
      status: "success",
      count: orders.length,
      data: orders
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * 建立具備 CORS 友善支援的 JSON 回傳物件
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

