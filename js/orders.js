// 麥吉點餐系統 - 查看點餐狀況與統計邏輯

const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbyvhfoq91wfOBgdNSMIuM0nJieSiaT9t1QBXH6iTSa_XBliMOUfQsr4vFPRci-oaQyH/exec";
const DEFAULT_SCRIPT_URL_KEY = "machi_orders_gas_url";
const LOCAL_STORAGE_ORDERS_KEY = "machi_orders_data";

let currentOrdersList = [];

document.addEventListener("DOMContentLoaded", () => {
  initSettingsModal();
  initFilter();
  initButtons();
  loadOrders();
});

/**
 * 載入點餐資料 (優先嘗試從 Google Apps Script GET 取得 Google Sheet 資料，若無則讀取 localStorage)
 */
async function loadOrders() {
  const syncBadge = document.getElementById("syncStatusBadge");
  const gasUrl = localStorage.getItem(DEFAULT_SCRIPT_URL_KEY) || DEFAULT_GAS_URL;

  let orders = [];

  if (gasUrl) {
    if (syncBadge) syncBadge.textContent = "Google Sheet 同步中...";
    try {
      const response = await fetch(gasUrl);
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.status === "success" && Array.isArray(resJson.data)) {
          orders = resJson.data;
          if (syncBadge) {
            syncBadge.textContent = "✅ 已與 Google Sheet 即時同步";
            syncBadge.style.backgroundColor = "#E6F4EA";
            syncBadge.style.color = "#137333";
          }
        }
      }
    } catch (err) {
      console.warn("無法自 Apps Script 獲取資料，切換為本機儲存紀錄：", err);
      if (syncBadge) {
        syncBadge.textContent = "📂 本機快取模式";
        syncBadge.style.backgroundColor = "#FDF0ED";
        syncBadge.style.color = "#B84A39";
      }
    }
  }

  // 若未從雲端取得，讀取本機 localStorage
  if (orders.length === 0) {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      try {
        orders = JSON.parse(raw);
      } catch (e) {
        orders = [];
      }
    }
  }

  // 若仍無資料，注入兩筆符合規範的測試訂單
  if (!orders || orders.length === 0) {
    orders = [
      {
        id: 1,
        timestamp: "2026/10/19 16:20:00",
        customerName: "王小明",
        drinkName: "日月潭紅茶",
        size: "L",
        ice: "少冰",
        sweetness: "五分糖",
        toppings: "白玉珍珠(+$10)",
        quantity: 1,
        unitPrice: 55,
        totalPrice: 55,
        note: "自備環保杯"
      },
      {
        id: 2,
        timestamp: "2026/10/19 16:22:30",
        customerName: "李小華",
        drinkName: "烤布蕾紅茶拿鐵",
        size: "M",
        ice: "去冰",
        sweetness: "三分糖",
        toppings: "無",
        quantity: 2,
        unitPrice: 80,
        totalPrice: 160,
        note: "無"
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }

  currentOrdersList = orders;
  renderDashboard(orders);
}

/**
 * 渲染儀表板統計與明細
 */
function renderDashboard(orders) {
  // 1. 統計看板計算
  const totalCups = orders.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const totalPrice = orders.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const uniquePeople = new Set(orders.map(item => item.customerName).filter(Boolean)).size;
  const avgPrice = totalCups > 0 ? Math.round(totalPrice / totalCups) : 0;

  document.getElementById("statTotalCups").textContent = `${totalCups} 杯`;
  document.getElementById("statTotalPrice").textContent = `NT$ ${totalPrice}`;
  document.getElementById("statTotalPeople").textContent = `${uniquePeople} 人`;
  document.getElementById("statAvgPrice").textContent = `NT$ ${avgPrice}`;

  // 2. 各飲品數量統計 (品項彙整)
  renderSummaryItems(orders);

  // 3. 詳細明細清單渲染
  renderTable(orders);
}

/**
 * 渲染品項分類彙整
 */
function renderSummaryItems(orders) {
  const container = document.getElementById("summaryItemsContainer");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<div class="empty-list-notice">尚無點餐資料</div>`;
    return;
  }

  const drinkCountMap = {};
  orders.forEach(item => {
    const key = `${item.drinkName} (${item.size || "M"})`;
    drinkCountMap[key] = (drinkCountMap[key] || 0) + Number(item.quantity || 1);
  });

  // 依杯數由大到小排序
  const sorted = Object.entries(drinkCountMap).sort((a, b) => b[1] - a[1]);

  container.innerHTML = "";
  sorted.forEach(([drinkName, count]) => {
    const itemEl = document.createElement("div");
    itemEl.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background-color: #FAF8F5;
      border: 1px solid var(--color-border);
      border-radius: 8px;
    `;
    itemEl.innerHTML = `
      <span style="font-weight:700; color:var(--color-text-main);">${drinkName}</span>
      <span style="font-size:1.05rem; font-weight:800; color:var(--color-primary); background:#FDF0ED; padding:2px 10px; border-radius:12px;">${count} 杯</span>
    `;
    container.appendChild(itemEl);
  });
}

/**
 * 渲染個別點餐明細表格
 */
function renderTable(orders) {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding:30px; color:var(--color-text-muted);">
          目前尚無點餐資料，請先前往「我要點餐」進行訂購。
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  orders.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-size:0.8rem; color:var(--color-text-muted); white-space:nowrap;">${item.timestamp || "-"}</td>
      <td style="font-weight:700; color:var(--color-text-main);">${item.customerName || "-"}</td>
      <td style="font-weight:600;">${item.drinkName || "-"}</td>
      <td>${item.size || "-"}</td>
      <td><span class="mini-tag">${item.ice || "-"}</span></td>
      <td><span class="mini-tag">${item.sweetness || "-"}</span></td>
      <td style="font-size:0.85rem;">${item.toppings || "無"}</td>
      <td style="text-align:center; font-weight:700;">${item.quantity || 1}</td>
      <td style="color:var(--color-text-muted);">$${item.unitPrice || 0}</td>
      <td style="font-weight:800; color:var(--color-primary);">$${item.totalPrice || 0}</td>
      <td style="font-size:0.85rem; color:var(--color-text-muted);">${item.note || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 搜尋篩選功能
 */
function initFilter() {
  const filterInput = document.getElementById("filterInput");
  if (!filterInput) return;

  filterInput.addEventListener("input", (e) => {
    const kw = e.target.value.trim().toLowerCase();
    if (!kw) {
      renderTable(currentOrdersList);
      return;
    }

    const filtered = currentOrdersList.filter(item => {
      const name = (item.customerName || "").toLowerCase();
      const drink = (item.drinkName || "").toLowerCase();
      const note = (item.note || "").toLowerCase();
      return name.includes(kw) || drink.includes(kw) || note.includes(kw);
    });

    renderTable(filtered);
  });
}

/**
 * 功能按鈕初始化 (重新整理、匯出 CSV)
 */
function initButtons() {
  const btnRefresh = document.getElementById("btnRefreshOrders");
  const btnExport = document.getElementById("btnExportCsv");

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      btnRefresh.textContent = "載入中...";
      loadOrders().finally(() => {
        btnRefresh.textContent = "🔄 重新整理資料";
      });
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", exportOrdersToCsv);
  }
}

/**
 * 匯出 CSV 檔案
 */
function exportOrdersToCsv() {
  if (currentOrdersList.length === 0) {
    alert("目前尚無任何點餐資料可匯出！");
    return;
  }

  const headers = ["時間戳記", "訂購姓名", "飲料品項", "規格大小", "溫度冰塊", "甜度", "加料與客製", "數量", "單價", "總金額", "備註說明"];
  const rows = currentOrdersList.map(item => [
    `"${item.timestamp || ""}"`,
    `"${item.customerName || ""}"`,
    `"${item.drinkName || ""}"`,
    `"${item.size || ""}"`,
    `"${item.ice || ""}"`,
    `"${item.sweetness || ""}"`,
    `"${item.toppings || "無"}"`,
    item.quantity || 1,
    item.unitPrice || 0,
    item.totalPrice || 0,
    `"${item.note || ""}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `2026手搖飲點餐記錄_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 設定視窗
 */
function initSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const openBtn = document.getElementById("openSettingsBtn");
  const closeBtn = document.getElementById("closeSettingsModal");
  const saveBtn = document.getElementById("btnSaveSettings");
  const testBtn = document.getElementById("btnTestApi");
  const urlInput = document.getElementById("appsScriptUrlInput");

  if (!modal) return;

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      urlInput.value = localStorage.getItem(DEFAULT_SCRIPT_URL_KEY) || "";
      modal.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const val = urlInput.value.trim();
      localStorage.setItem(DEFAULT_SCRIPT_URL_KEY, val);
      alert("Google Apps Script 網址已儲存！將立即載入資料。");
      modal.classList.remove("active");
      loadOrders();
    });
  }

  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const val = urlInput.value.trim();
      if (!val) {
        alert("請輸入 Apps Script URL！");
        return;
      }
      testBtn.textContent = "連線中...";
      try {
        const res = await fetch(val);
        const data = await res.json();
        alert(`✅ 連線成功！共抓取 ${data.count || 0} 筆紀錄。`);
      } catch (err) {
        alert(`❌ 連線測試失敗：${err.message}`);
      } finally {
        testBtn.textContent = "測試連線";
      }
    });
  }
}
