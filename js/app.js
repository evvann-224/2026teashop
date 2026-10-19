// 麥吉點餐系統 - 前端互動與價格即時計算主邏輯

// 預設 Google Apps Script Web App URL (可從 localStorage 讀取或設定)
const DEFAULT_SCRIPT_URL_KEY = "machi_orders_gas_url";
const LOCAL_STORAGE_ORDERS_KEY = "machi_orders_data";

let currentSelectedDrink = null;
let currentCustomization = {
  size: "M",
  unitPrice: 0,
  ice: "少冰",
  sweetness: "五分糖",
  isOatMilk: false,
  selectedToppings: [],
  quantity: 1,
  note: ""
};

// 待送出購物車清單
let cartItems = [];

// DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", () => {
  initMenuZoom();
  initCategoryTabs();
  initSearch();
  initSettingsModal();
  initOrderForm();
  
  // 預設選中第一款人氣飲品
  const firstCategory = MENU_DATA[0];
  if (firstCategory && firstCategory.items.length > 0) {
    selectDrink(firstCategory.items[0]);
  }
});

/**
 * 菜單圖片點擊放大縮小
 */
function initMenuZoom() {
  const menuImg = document.getElementById("menuImage");
  const toggleBtn = document.getElementById("toggleMenuZoomBtn");
  let isZoomed = false;

  function toggleZoom() {
    isZoomed = !isZoomed;
    if (isZoomed) {
      menuImg.style.maxHeight = "none";
      menuImg.style.cursor = "zoom-out";
      if (toggleBtn) toggleBtn.textContent = "🔍 點擊圖片還原大小";
    } else {
      menuImg.style.maxHeight = "80vh";
      menuImg.style.cursor = "zoom-in";
      if (toggleBtn) toggleBtn.textContent = "🔍 點擊圖片可放大檢視";
    }
  }

  if (menuImg) menuImg.addEventListener("click", toggleZoom);
  if (toggleBtn) toggleBtn.addEventListener("click", toggleZoom);
}

/**
 * 飲品分類切換與卡片渲染
 */
function initCategoryTabs() {
  const tabs = document.querySelectorAll(".cat-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const categoryId = tab.getAttribute("data-cat");
      renderDrinkCards(categoryId);
    });
  });

  // 初始渲染全部飲品
  renderDrinkCards("all");
}

/**
 * 飲品即時搜尋
 */
function initSearch() {
  const searchInput = document.getElementById("searchDrinkInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim().toLowerCase();
    renderDrinkCards("all", keyword);
  });
}

/**
 * 渲染飲品卡片清單
 */
function renderDrinkCards(catFilter = "all", keyword = "") {
  const container = document.getElementById("drinkCardsContainer");
  if (!container) return;

  container.innerHTML = "";
  let matchedItems = [];

  MENU_DATA.forEach(cat => {
    if (catFilter === "all" || cat.categoryId === catFilter) {
      cat.items.forEach(item => {
        if (!keyword || item.name.toLowerCase().includes(keyword)) {
          matchedItems.push({ ...item, categoryName: cat.categoryName });
        }
      });
    }
  });

  if (matchedItems.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--color-text-muted);">查無符合「${keyword}」的飲品</div>`;
    return;
  }

  matchedItems.forEach(item => {
    const card = document.createElement("div");
    card.className = `drink-card ${currentSelectedDrink && currentSelectedDrink.id === item.id ? "selected" : ""}`;
    card.setAttribute("data-id", item.id);

    // 標籤解析
    let tagsHtml = "";
    if (item.isPopular) tagsHtml += `<span class="mini-tag star">★ 人氣</span>`;
    if (item.tempType === "I/H") tagsHtml += `<span class="mini-tag hot">可熱飲</span>`;
    if (item.isSlush) tagsHtml += `<span class="mini-tag">冰沙</span>`;
    if (item.isBottle) tagsHtml += `<span class="mini-tag">瓶裝</span>`;

    // 價格標示
    let priceText = `$${item.price}`;
    if (item.availableSizes && typeof item.availableSizes[0] === "object") {
      priceText = `$${item.availableSizes[0].price} 起`;
    }

    card.innerHTML = `
      <div>
        <div class="drink-card-top">
          <div class="drink-name">${item.name}</div>
          <div class="drink-tags">${tagsHtml}</div>
        </div>
        ${item.note ? `<div class="drink-desc">${item.note}</div>` : ""}
      </div>
      <div class="drink-price-line">
        <span class="drink-default-size">${item.size || "M"}</span>
        <span class="drink-price">${priceText}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".drink-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectDrink(item);
    });

    container.appendChild(card);
  });
}

/**
 * 選中某款飲品並初始化客製化選項
 */
function selectDrink(item) {
  currentSelectedDrink = item;

  // 更新選定標題
  const titleEl = document.getElementById("activeDrinkName");
  if (titleEl) titleEl.textContent = `${item.name} (${item.categoryName || ""})`;

  // 重置客製狀態
  currentCustomization.quantity = 1;
  currentCustomization.isOatMilk = false;
  currentCustomization.selectedToppings = [];
  currentCustomization.note = "";

  const qtyInput = document.getElementById("inputQty");
  if (qtyInput) qtyInput.value = 1;
  const noteInput = document.getElementById("itemNote");
  if (noteInput) noteInput.value = "";

  // 1. 規格配置
  renderSizeOptions(item);

  // 2. 溫度/冰塊配置
  renderIceOptions(item);

  // 3. 甜度配置
  renderSweetnessOptions(item);

  // 4. 燕麥奶選項
  const oatMilkGroup = document.getElementById("oatMilkGroup");
  const oatMilkCheckbox = document.getElementById("oatMilkCheckbox");
  if (oatMilkGroup && oatMilkCheckbox) {
    if (item.allowOatMilk) {
      oatMilkGroup.style.display = "flex";
      oatMilkCheckbox.checked = false;
      oatMilkCheckbox.onchange = () => {
        currentCustomization.isOatMilk = oatMilkCheckbox.checked;
        updateLiveCalculation();
      };
    } else {
      oatMilkGroup.style.display = "none";
      oatMilkCheckbox.checked = false;
    }
  }

  // 5. 加料配置
  renderToppingsOptions(item);

  // 執行即時價格計算
  updateLiveCalculation();
}

/**
 * 規格容量選項渲染
 */
function renderSizeOptions(item) {
  const container = document.getElementById("sizeOptions");
  if (!container) return;
  container.innerHTML = "";

  if (item.availableSizes && typeof item.availableSizes[0] === "object") {
    // 多規格價格 (如珍珠紅茶拿鐵 M $70 / L $80)
    currentCustomization.size = item.availableSizes[0].size;
    currentCustomization.unitPrice = item.availableSizes[0].price;

    item.availableSizes.forEach((sObj, idx) => {
      const label = document.createElement("label");
      label.className = "pill-radio-label";
      label.innerHTML = `
        <input type="radio" name="sizeOpt" value="${sObj.size}" data-price="${sObj.price}" ${idx === 0 ? "checked" : ""}>
        <span class="pill-btn">${sObj.size} ($${sObj.price})</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        currentCustomization.size = e.target.value;
        currentCustomization.unitPrice = Number(e.target.dataset.price);
        updateLiveCalculation();
      });
      container.appendChild(label);
    });
  } else {
    // 單一規格
    const singleSize = item.size || "M";
    currentCustomization.size = singleSize;
    currentCustomization.unitPrice = item.price;

    const label = document.createElement("label");
    label.className = "pill-radio-label";
    label.innerHTML = `
      <input type="radio" name="sizeOpt" value="${singleSize}" checked disabled>
      <span class="pill-btn locked">${singleSize} (固定規格 $${item.price})</span>
    `;
    container.appendChild(label);
  }
}

/**
 * 冰塊與溫度選項渲染
 */
function renderIceOptions(item) {
  const container = document.getElementById("iceOptions");
  const noticeEl = document.getElementById("iceNotice");
  if (!container) return;
  container.innerHTML = "";

  if (item.iceFixed) {
    currentCustomization.ice = "冰塊固定";
    if (noticeEl) noticeEl.textContent = "此品項冰塊比例固定";
    container.innerHTML = `
      <label class="pill-radio-label">
        <input type="radio" name="iceOpt" value="冰塊固定" checked disabled>
        <span class="pill-btn locked">冰塊固定</span>
      </label>
    `;
    return;
  }

  if (item.isSlush) {
    currentCustomization.ice = "冰沙";
    if (noticeEl) noticeEl.textContent = "此品項為現打冰沙飲品";
    container.innerHTML = `
      <label class="pill-radio-label">
        <input type="radio" name="iceOpt" value="冰沙" checked disabled>
        <span class="pill-btn locked">現打冰沙</span>
      </label>
    `;
    return;
  }

  // 正常可選
  if (noticeEl) noticeEl.textContent = "Tips: 推薦少冰";
  currentCustomization.ice = "少冰";

  ICE_OPTIONS.forEach(opt => {
    // 若僅限冷飲 (tempType === "I")，不顯示溫、熱
    if (item.tempType === "I" && opt.hotOnly) return;

    const label = document.createElement("label");
    label.className = "pill-radio-label";
    const isChecked = opt.value === "少冰";
    label.innerHTML = `
      <input type="radio" name="iceOpt" value="${opt.value}" ${isChecked ? "checked" : ""}>
      <span class="pill-btn">${opt.label}</span>
    `;
    label.querySelector("input").addEventListener("change", (e) => {
      currentCustomization.ice = e.target.value;
      updateLiveCalculation();
    });
    container.appendChild(label);
  });
}

/**
 * 甜度選項渲染
 */
function renderSweetnessOptions(item) {
  const container = document.getElementById("sweetOptions");
  const noticeEl = document.getElementById("sweetNotice");
  if (!container) return;
  container.innerHTML = "";

  if (item.sweetFixed) {
    currentCustomization.sweetness = "甜度固定";
    if (noticeEl) noticeEl.textContent = "此品項甜度配方固定";
    container.innerHTML = `
      <label class="pill-radio-label">
        <input type="radio" name="sweetOpt" value="甜度固定" checked disabled>
        <span class="pill-btn locked">甜度固定</span>
      </label>
    `;
    return;
  }

  if (noticeEl) noticeEl.textContent = "Tips: 飲料皆建議半糖";
  currentCustomization.sweetness = "五分糖";

  SWEETNESS_OPTIONS.forEach(opt => {
    const label = document.createElement("label");
    label.className = "pill-radio-label";
    const isChecked = opt.value === "五分糖";
    label.innerHTML = `
      <input type="radio" name="sweetOpt" value="${opt.value}" ${isChecked ? "checked" : ""}>
      <span class="pill-btn">${opt.label}</span>
    `;
    label.querySelector("input").addEventListener("change", (e) => {
      currentCustomization.sweetness = e.target.value;
      updateLiveCalculation();
    });
    container.appendChild(label);
  });
}

/**
 * 加料選項渲染
 */
function renderToppingsOptions(item) {
  const container = document.getElementById("toppingsContainer");
  const noticeEl = document.getElementById("toppingsNotice");
  if (!container) return;
  container.innerHTML = "";

  if (item.noToppings) {
    if (noticeEl) noticeEl.textContent = "門市規範：瓶裝類、芝士奶蓋類、鮮榨水果、波波氣泡不提供加料";
    container.innerHTML = `
      <div style="grid-column: 1/-1; font-size:0.85rem; color:var(--color-text-muted); background:#F4EFEB; padding:10px 14px; border-radius:8px;">
        ⚠️ 本品項依門市規範不提供加料
      </div>
    `;
    return;
  }

  if (noticeEl) noticeEl.textContent = "可自由複選加料";

  TOPPINGS.forEach(top => {
    const label = document.createElement("label");
    label.className = "topping-checkbox-label";
    label.innerHTML = `
      <span><input type="checkbox" value="${top.name}" data-price="${top.price}"> ${top.name}</span>
      <span style="color:var(--color-primary); font-weight:700;">+$${top.price}</span>
    `;

    const chk = label.querySelector("input");
    chk.addEventListener("change", () => {
      recalculateSelectedToppings();
      updateLiveCalculation();
    });

    container.appendChild(label);
  });
}

/**
 * 計算已勾選加料
 */
function recalculateSelectedToppings() {
  const chks = document.querySelectorAll("#toppingsContainer input[type='checkbox']:checked");
  currentCustomization.selectedToppings = [];
  chks.forEach(chk => {
    currentCustomization.selectedToppings.push({
      name: chk.value,
      price: Number(chk.dataset.price)
    });
  });
}

/**
 * 表單與數量按鈕初始化
 */
function initOrderForm() {
  const btnMinus = document.getElementById("btnMinusQty");
  const btnPlus = document.getElementById("btnPlusQty");
  const qtyInput = document.getElementById("inputQty");
  const btnAddToCart = document.getElementById("btnAddToCart");
  const btnSubmitOrder = document.getElementById("btnSubmitOrder");
  const btnClearCart = document.getElementById("btnClearCartBtn");
  const itemNote = document.getElementById("itemNote");

  if (btnMinus) {
    btnMinus.addEventListener("click", () => {
      let qty = parseInt(qtyInput.value) || 1;
      if (qty > 1) {
        qty--;
        qtyInput.value = qty;
        currentCustomization.quantity = qty;
        updateLiveCalculation();
      }
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener("click", () => {
      let qty = parseInt(qtyInput.value) || 1;
      qty++;
      qtyInput.value = qty;
      currentCustomization.quantity = qty;
      updateLiveCalculation();
    });
  }

  if (itemNote) {
    itemNote.addEventListener("input", (e) => {
      currentCustomization.note = e.target.value.trim();
    });
  }

  // 加入點餐清單
  if (btnAddToCart) {
    btnAddToCart.addEventListener("click", addItemToCart);
  }

  // 清空清單
  if (btnClearCart) {
    btnClearCart.addEventListener("click", () => {
      if (cartItems.length === 0) return;
      if (confirm("確定要清空目前待送出的點餐清單嗎？")) {
        cartItems = [];
        renderCart();
      }
    });
  }

  // 送出點餐 (必須連同即時計算價格一起送出)
  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener("click", submitOrder);
  }
}

/**
 * 即時價格試算更新 (核心需求：即時計算價格)
 */
function updateLiveCalculation() {
  if (!currentSelectedDrink) return;

  const basePrice = currentCustomization.unitPrice || currentSelectedDrink.price || 0;
  let extraPrice = 0;

  // 燕麥奶
  const oatRow = document.getElementById("calcOatMilkRow");
  if (currentCustomization.isOatMilk) {
    extraPrice += 15;
    if (oatRow) oatRow.style.display = "flex";
  } else {
    if (oatRow) oatRow.style.display = "none";
  }

  // 加料
  const topRow = document.getElementById("calcToppingsRow");
  const topNames = document.getElementById("calcToppingsNames");
  const topPrice = document.getElementById("calcToppingsPrice");
  let toppingsTotal = 0;
  if (currentCustomization.selectedToppings.length > 0) {
    toppingsTotal = currentCustomization.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    extraPrice += toppingsTotal;
    if (topRow) {
      topRow.style.display = "flex";
      topNames.textContent = `加料 (${currentCustomization.selectedToppings.map(t => t.name).join("+")})`;
      topPrice.textContent = `+$${toppingsTotal}`;
    }
  } else {
    if (topRow) topRow.style.display = "none";
  }

  const singleCupTotal = basePrice + extraPrice;
  const currentQty = currentCustomization.quantity || 1;
  const itemSubtotal = singleCupTotal * currentQty;

  // 更新左側按鈕小計
  const btnSubtotal = document.getElementById("btnCurrentItemSubtotal");
  if (btnSubtotal) btnSubtotal.textContent = `$${itemSubtotal}`;

  // 更新右側即時單杯看板
  const nameDisplay = document.getElementById("calcItemNameDisplay");
  const basePriceDisplay = document.getElementById("calcBasePriceDisplay");
  const qtyDisplay = document.getElementById("calcQtyDisplay");
  const subtotalDisplay = document.getElementById("calcItemSubtotalDisplay");
  const activeBasePrice = document.getElementById("activeDrinkBasePrice");

  if (nameDisplay) nameDisplay.textContent = `${currentSelectedDrink.name} (${currentCustomization.size})`;
  if (basePriceDisplay) basePriceDisplay.textContent = `$${basePrice}`;
  if (qtyDisplay) qtyDisplay.textContent = `x ${currentQty}`;
  if (subtotalDisplay) subtotalDisplay.textContent = `$${itemSubtotal}`;
  if (activeBasePrice) activeBasePrice.textContent = `$${singleCupTotal} / 杯`;

  // 同步更新總金額 (若購物車為空，總金額即為此單杯小計)
  updateGrandTotal();
}

/**
 * 將當前客製品項加入點餐清單 (購物車)
 */
function addItemToCart() {
  if (!currentSelectedDrink) {
    alert("請先選擇要點的飲品！");
    return;
  }

  const basePrice = currentCustomization.unitPrice || currentSelectedDrink.price || 0;
  let extraPrice = 0;
  let customDescList = [];

  if (currentCustomization.isOatMilk) {
    extraPrice += 15;
    customDescList.push("換燕麥奶(+$15)");
  }

  if (currentCustomization.selectedToppings.length > 0) {
    const topsSum = currentCustomization.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    extraPrice += topsSum;
    customDescList.push(currentCustomization.selectedToppings.map(t => `${t.name}(+$${t.price})`).join("、"));
  }

  const unitFinalPrice = basePrice + extraPrice;
  const qty = currentCustomization.quantity;
  const totalItemPrice = unitFinalPrice * qty;

  const orderItem = {
    cartId: Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    drinkName: currentSelectedDrink.name,
    size: currentCustomization.size,
    ice: currentCustomization.ice,
    sweetness: currentCustomization.sweetness,
    toppingsText: customDescList.length > 0 ? customDescList.join(" | ") : "無",
    quantity: qty,
    unitPrice: unitFinalPrice,
    totalPrice: totalItemPrice,
    note: currentCustomization.note || ""
  };

  cartItems.push(orderItem);
  renderCart();

  // 震動或小動畫提示
  const btnAddToCart = document.getElementById("btnAddToCart");
  if (btnAddToCart) {
    const originalText = btnAddToCart.innerHTML;
    btnAddToCart.innerHTML = `✅ 已成功加入！`;
    btnAddToCart.style.backgroundColor = "#2D6A4F";
    setTimeout(() => {
      btnAddToCart.innerHTML = originalText;
      btnAddToCart.style.backgroundColor = "";
    }, 1200);
  }
}

/**
 * 渲染購物車清單
 */
function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  const badge = document.getElementById("cartCountBadge");
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-list-notice">
        目前清單尚無飲品<br>請在左側選取品項並點擊「加入點餐清單」
      </div>
    `;
    if (badge) badge.textContent = "共 0 杯";
    updateGrandTotal();
    return;
  }

  const totalCups = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  if (badge) badge.textContent = `共 ${totalCups} 杯 (${cartItems.length} 項)`;

  container.innerHTML = "";
  cartItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `
      <div class="item-info-main">
        <div class="item-name-size">${item.drinkName} <span style="font-weight:normal; font-size:0.85rem;">(${item.size})</span></div>
        <div class="item-spec-tags">${item.ice} / ${item.sweetness} / ${item.toppingsText}</div>
        ${item.note ? `<div class="item-spec-tags" style="color:var(--color-primary);">備註: ${item.note}</div>` : ""}
      </div>
      <div class="item-qty-price">
        <div class="item-total-cost">$${item.totalPrice}</div>
        <div style="font-size:0.75rem; color:var(--color-text-muted);">$${item.unitPrice} x ${item.quantity}</div>
        <button type="button" class="btn-remove-item" data-index="${index}" title="刪除此品項">✕ 刪除</button>
      </div>
    `;

    row.querySelector(".btn-remove-item").addEventListener("click", () => {
      cartItems.splice(index, 1);
      renderCart();
    });

    container.appendChild(row);
  });

  updateGrandTotal();
}

/**
 * 即時更新總價格
 */
function updateGrandTotal() {
  const grandTotalEl = document.getElementById("grandTotalPrice");
  const grandCupTextEl = document.getElementById("grandTotalCupText");
  if (!grandTotalEl) return;

  let grandTotal = 0;
  let totalCups = 0;

  if (cartItems.length > 0) {
    grandTotal = cartItems.reduce((acc, it) => acc + it.totalPrice, 0);
    totalCups = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  } else if (currentSelectedDrink) {
    // 若購物車尚無項目，預覽當前配置價格
    const base = currentCustomization.unitPrice || currentSelectedDrink.price || 0;
    let extra = currentCustomization.isOatMilk ? 15 : 0;
    if (currentCustomization.selectedToppings.length > 0) {
      extra += currentCustomization.selectedToppings.reduce((s, t) => s + t.price, 0);
    }
    const qty = currentCustomization.quantity || 1;
    grandTotal = (base + extra) * qty;
    totalCups = qty;
  }

  grandTotalEl.textContent = grandTotal;
  if (grandCupTextEl) grandCupTextEl.textContent = `${totalCups} 杯`;
}

/**
 * 表單送出至 Google Sheet
 * 嚴格要求：
 * 1. 表單中加上「輸入姓名」作為餐點識別
 * 2. 必須將即時計算的價格一起送出
 * 3. 儲存於 Google Sheet，檔名「2026手搖飲點餐記錄」
 */
async function submitOrder() {
  const nameInput = document.getElementById("customerName");
  const customerName = nameInput ? nameInput.value.trim() : "";

  if (!customerName) {
    alert("請務必輸入「訂購人姓名」，以作為餐點識別！");
    if (nameInput) nameInput.focus();
    return;
  }

  // 若清單為空，但目前有選擇中的餐點，自動將其加入購物車
  if (cartItems.length === 0) {
    if (currentSelectedDrink) {
      addItemToCart();
    } else {
      alert("請至少選擇一項欲訂購的飲品！");
      return;
    }
  }

  const submitBtn = document.getElementById("btnSubmitOrder");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>⏳ 送出資料至 Google Sheet 中...</span>`;

  // 整理要送出的資料陣列 (必須包含即時計算的單價與總價)
  const nowStr = new Date().toLocaleString("zh-TW", { hour12: false });
  const itemsToSend = cartItems.map(item => ({
    timestamp: nowStr,
    customerName: customerName,
    drinkName: item.drinkName,
    size: item.size,
    ice: item.ice,
    sweetness: item.sweetness,
    toppings: item.toppingsText,
    quantity: item.quantity,
    unitPrice: item.unitPrice,     // 必須包含即時價格
    totalPrice: item.totalPrice,   // 必須包含即時價格
    note: item.note
  }));

  // 1. 本地備存至 localStorage (保障離線或即使網路連線異常資料仍可查看)
  saveToLocalStorage(itemsToSend);

  // 2. 傳送到 Google Apps Script
  const gasUrl = getGasUrl();
  let serverSuccess = false;
  let serverMessage = "";

  if (gasUrl) {
    try {
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(itemsToSend)
      });

      if (response.ok) {
        serverSuccess = true;
        try {
          const resJson = await response.json();
          serverMessage = resJson.message || "成功儲存至 Google Sheet！";
        } catch (_) {
          serverMessage = "已成功發送至 Google Apps Script！";
        }
      } else {
        serverMessage = `伺服器回應狀態碼: ${response.status}`;
      }
    } catch (netErr) {
      console.warn("GAS 送出遭遇網路或跨域異常，以備份機制保存：", netErr);
      serverMessage = "已將點餐資料存入本機點餐紀錄！(若已部署 Apps Script，請確認存取權限是否設定為「所有人」)";
    }
  } else {
    serverMessage = "訂單已成功存入本機點餐紀錄！\n提示：點擊右上角 ⚙️ 設定 Google Apps Script URL，即可同步即時寫入 Google Sheet。";
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnText;

  // 清空購物車
  cartItems = [];
  renderCart();

  // 成功彈窗
  alert(`🎉 恭喜 ${customerName}！點餐成功！\n\n${serverMessage}\n\n系統將為您跳轉至「查看目前點餐狀況」頁面。`);
  window.location.href = "orders.html";
}

/**
 * 將點餐資料儲存至 localStorage
 */
function saveToLocalStorage(newItems) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const combined = [...existing, ...newItems];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(combined));
  } catch (e) {
    console.error("無法寫入 localStorage:", e);
  }
}

/**
 * 取得 Google Apps Script 部署 URL
 */
function getGasUrl() {
  return localStorage.getItem(DEFAULT_SCRIPT_URL_KEY) || "";
}

/**
 * 設定彈跳視窗控制
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
      urlInput.value = getGasUrl();
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
      alert("Google Apps Script 網址已儲存！");
      modal.classList.remove("active");
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
        alert(`✅ 連線成功！伺服器回應：${JSON.stringify(data)}`);
      } catch (err) {
        alert(`❌ 連線測試失敗：${err.message}\n請檢查網址或權限設定是否為「所有人 (Anyone)」。`);
      } finally {
        testBtn.textContent = "測試連線";
      }
    });
  }
}
