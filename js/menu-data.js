// 麥吉 machi machi 完整菜單資料庫
// 嚴格依據 menu.jpg 內容建置，涵蓋所有餐點項目與客製規則

const MENU_DATA = [
  {
    categoryId: "pure-tea",
    categoryName: "麥吉現萃純茶",
    description: "所有純茶類，皆是現點現萃而成，口感清澈，並保留茶葉最馥郁的原味",
    items: [
      {
        id: "pt-1",
        name: "日月潭紅茶",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 45,
        isPopular: true,
        canAddtoppings: true
      },
      {
        id: "pt-2",
        name: "四季春茶",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 45,
        isPopular: false,
        canAddtoppings: true
      },
      {
        id: "pt-3",
        name: "白毫茉香綠茶",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 45,
        isPopular: false,
        canAddtoppings: true
      },
      {
        id: "pt-4",
        name: "烏龍鐵觀音",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 45,
        isPopular: true,
        canAddtoppings: true
      },
      {
        id: "pt-5",
        name: "無咖啡因玄米麥茶",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 45,
        isPopular: false,
        canAddtoppings: true
      },
      {
        id: "pt-6",
        name: "玄米麥珍Q椰",
        size: "L",
        availableSizes: ["L"],
        tempType: "I", // 僅冷飲
        price: 65,
        isPopular: false,
        canAddtoppings: true,
        defaultToppings: ["珍珠", "椰果"]
      },
      {
        id: "pt-7",
        name: "玄米麥抹茶凍",
        size: "L",
        availableSizes: ["L"],
        tempType: "I", // 僅冷飲
        price: 75,
        isPopular: false,
        canAddtoppings: true,
        defaultToppings: ["抹茶凍"]
      },
      {
        id: "pt-8",
        name: "梅子綠茶",
        size: "M",
        availableSizes: ["M"],
        tempType: "I", // 僅冷飲
        price: 50,
        isPopular: false,
        canAddtoppings: true
      },
      {
        id: "pt-9",
        name: "梅子凍茉香綠",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 80,
        isPopular: true,
        iceFixed: true, // 冰塊固定
        noToppings: true, // 瓶裝不提供加料
        isBottle: true
      }
    ]
  },
  {
    categoryId: "fresh-milk-latte",
    categoryName: "鮮奶拿鐵",
    description: "拿鐵為台南柳營鮮奶使用",
    items: [
      {
        id: "latte-1",
        name: "麥吉紅茶拿鐵",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 65,
        isPopular: true,
        note: "日月潭紅茶與鮮奶的黃金搭配，茶香濃厚，口感滑順，後調回甘",
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-2",
        name: "鐵觀音拿鐵",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: false,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-3",
        name: "烤布蕾紅茶拿鐵",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 80,
        isPopular: true,
        note: "醇香布蕾融入香滑鮮奶，口味濃厚療癒",
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-4",
        name: "巧克力布蕾紅茶拿鐵",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 90,
        isPopular: false,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-5",
        name: "三重巧克力可可亞",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 75,
        isPopular: false,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-6",
        name: "烤黑糖奶蓋奶茶",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 75,
        isPopular: false,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-7",
        name: "珍珠紅茶拿鐵",
        size: "M",
        availableSizes: [
          { size: "M", price: 70 },
          { size: "L", price: 80 }
        ],
        tempType: "I/H",
        price: 70,
        isPopular: true,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-8",
        name: "小芋圓紅茶拿鐵",
        size: "M",
        availableSizes: [
          { size: "M", price: 75 },
          { size: "L", price: 85 }
        ],
        tempType: "I/H",
        price: 75,
        isPopular: true,
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-9",
        name: "手炒黑糖鮮奶",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: false,
        iceFixed: true, // 冰塊固定
        sweetFixed: true, // 甜度固定
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-10",
        name: "靜岡抹茶紅豆布蕾奶霜",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 100,
        isPopular: false,
        isSlush: true, // 冰沙飲品
        allowOatMilk: true,
        canAddtoppings: true
      },
      {
        id: "latte-11",
        name: "奶酪靜岡抹茶拿鐵",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 130,
        isPopular: false,
        iceFixed: true,
        noToppings: true,
        isBottle: true,
        allowOatMilk: true
      },
      {
        id: "latte-12",
        name: "奶酪紅茶拿鐵",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 95,
        isPopular: true,
        iceFixed: true,
        noToppings: true,
        isBottle: true,
        note: "奶酪底下深色沈澱物為香草籽，請安心食用",
        allowOatMilk: true
      },
      {
        id: "latte-13",
        name: "草莓鮮奶",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 130,
        isPopular: true,
        iceFixed: true,
        sweetFixed: true,
        noToppings: true,
        isBottle: true,
        note: "甜美多汁、飽含果肉搭配濃濃的鮮奶，口感細膩",
        allowOatMilk: true
      },
      {
        id: "latte-14",
        name: "關西仙草紅茶拿鐵",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 90,
        isPopular: false,
        iceFixed: true,
        noToppings: true,
        isBottle: true,
        allowOatMilk: true
      },
      {
        id: "latte-15",
        name: "關西仙草鮮奶",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 95,
        isPopular: false,
        iceFixed: true,
        noToppings: true,
        isBottle: true,
        allowOatMilk: true
      }
    ]
  },
  {
    categoryId: "cheese-foam",
    categoryName: "芝士奶蓋",
    description: "使用台南柳營鮮奶、紐西蘭進口鮮奶油芝士手打而成，口感綿密搭配清醇茶香，甜而不膩",
    items: [
      {
        id: "cheese-1",
        name: "芝士日月潭紅茶",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: true,
        noToppings: true
      },
      {
        id: "cheese-2",
        name: "芝士四季春",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: false,
        noToppings: true
      },
      {
        id: "cheese-3",
        name: "芝士茉香綠",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: false,
        noToppings: true
      },
      {
        id: "cheese-4",
        name: "芝士鐵觀音",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 70,
        isPopular: true,
        noToppings: true
      },
      {
        id: "cheese-5",
        name: "芝士厚蓋紅茶拿鐵",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 80,
        isPopular: false,
        noToppings: true
      },
      {
        id: "cheese-6",
        name: "烤糰子麵茶芝士鐵觀音",
        size: "M",
        availableSizes: ["M"],
        tempType: "I/H",
        price: 95,
        isPopular: false,
        iceFixed: true,
        noToppings: true
      }
    ]
  },
  {
    categoryId: "fresh-fruit",
    categoryName: "現榨水果",
    description: "完全新鮮水果使用，不添加任何人工果露及香精。水果茶類內含多種水果：草莓、芭樂、蘋果、香吉士、百香果、檸檬。果香及茶味均勻，滿滿新鮮滋味",
    items: [
      {
        id: "fruit-1",
        name: "麥吉水果茉香綠",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 80,
        isPopular: false,
        noToppings: true
      },
      {
        id: "fruit-2",
        name: "麥吉水果四季春",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 80,
        isPopular: true,
        noToppings: true
      },
      {
        id: "fruit-3",
        name: "滿滿柳橙綠",
        size: "L",
        availableSizes: ["L"],
        tempType: "I/H",
        price: 85,
        isPopular: true,
        noToppings: true,
        note: "果肉飽滿的進口香吉士，茶底洋溢茉莉茶香，富含維他命C，清新怡人"
      },
      {
        id: "fruit-4",
        name: "芝士草莓",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 105,
        isPopular: false,
        isSlush: true, // 冰沙飲品
        noToppings: true
      },
      {
        id: "fruit-5",
        name: "芝士野莓",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 105,
        isPopular: true,
        isSlush: true, // 冰沙飲品
        noToppings: true,
        note: "選用新鮮滿滿的藍莓及草莓製成的冰沙，純天然清新爽口"
      },
      {
        id: "fruit-6",
        name: "葡萄柚綠茶冰沙",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 70,
        isPopular: true,
        isSlush: true,
        noToppings: true
      },
      {
        id: "fruit-7",
        name: "芝士葡萄柚綠茶冰沙",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 80,
        isPopular: false,
        isSlush: true,
        noToppings: true
      },
      {
        id: "fruit-8",
        name: "葡萄柚綠茶冰沙凍飲",
        size: "瓶裝",
        availableSizes: ["瓶裝"],
        tempType: "I",
        price: 95,
        isPopular: false,
        isSlush: true,
        noToppings: true,
        isBottle: true
      }
    ]
  },
  {
    categoryId: "sparkling",
    categoryName: "波波氣泡",
    description: "氣泡類飲品皆為冰塊甜度固定",
    items: [
      {
        id: "spark-1",
        name: "氣泡梅子茉香綠",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 70,
        isPopular: true,
        iceFixed: true,
        sweetFixed: true,
        noToppings: true
      },
      {
        id: "spark-2",
        name: "氣泡蜂蜜百香",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 70,
        isPopular: true,
        iceFixed: true,
        sweetFixed: true,
        noToppings: true
      },
      {
        id: "spark-3",
        name: "氣泡蜂蜜百香玄米麥茶",
        size: "M",
        availableSizes: ["M"],
        tempType: "I",
        price: 75,
        isPopular: false,
        iceFixed: true,
        sweetFixed: true,
        noToppings: true
      }
    ]
  }
];

// 加料選項 (Tips: 瓶裝類、芝士奶蓋類、鮮榨水果、波波氣泡不提供加料)
const TOPPINGS = [
  { id: "top-boba", name: "白玉珍珠", price: 10 },
  { id: "top-taroball", name: "手工芋圓", price: 20 },
  { id: "top-crystal", name: "寒天晶球", price: 15 },
  { id: "top-coconut", name: "椰果", price: 15 },
  { id: "top-matchajelly", name: "抹茶凍", price: 25 },
  { id: "top-dango", name: "日式烤糰子", price: 35 }
];

// 甜度選項 (Tips: 飲料皆建議半糖少冰)
const SWEETNESS_OPTIONS = [
  { label: "七分糖 (正常糖)", value: "七分糖" },
  { label: "五分糖 (推薦半糖)", value: "五分糖", recommended: true },
  { label: "三分糖 (微糖)", value: "三分糖" },
  { label: "無糖", value: "無糖" }
];

// 冰塊選項
const ICE_OPTIONS = [
  { label: "正常冰", value: "正常冰" },
  { label: "少冰 (推薦)", value: "少冰", recommended: true },
  { label: "去冰", value: "去冰" },
  { label: "常溫", value: "常溫" },
  { label: "溫 (僅限冷熱皆宜品項)", value: "溫", hotOnly: true },
  { label: "熱 (僅限冷熱皆宜品項)", value: "熱", hotOnly: true }
];

