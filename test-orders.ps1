param (
    [Parameter(Mandatory=$true)]
    [string]$GasUrl
)

$orders = @(
    @{
        timestamp = (Get-Date -Format "yyyy/MM/dd HH:mm:ss")
        customerName = "王小明"
        drinkName = "日月潭紅茶"
        size = "L"
        ice = "少冰"
        sweetness = "五分糖"
        toppings = "白玉珍珠(+$10)"
        quantity = 1
        unitPrice = 55
        totalPrice = 55
        note = "自備環保杯"
    },
    @{
        timestamp = (Get-Date -Format "yyyy/MM/dd HH:mm:ss")
        customerName = "李小華"
        drinkName = "烤布蕾紅茶拿鐵"
        size = "M"
        ice = "去冰"
        sweetness = "三分糖"
        toppings = "無"
        quantity = 2
        unitPrice = 80
        totalPrice = 160
        note = "無"
    }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "開始向 Google Sheet 發送兩筆測試訂單..." -ForegroundColor Cyan
Write-Host "目標 Web App URL: $GasUrl" -ForegroundColor Gray
Write-Host "========================================"

$jsonBody = $orders | ConvertTo-Json -Depth 3

try {
    # 發送 POST 請求寫入 Google Sheet
    $postResponse = Invoke-RestMethod -Uri $GasUrl -Method Post -Body $jsonBody -ContentType "text/plain;charset=utf-8"
    Write-Host "`n✅ POST 訂單送出成功！伺服器回應：" -ForegroundColor Green
    $postResponse | Format-List

    # 發送 GET 請求檢查 Google Sheet 是否確實存入
    Write-Host "`n🔍 正在至 Google Sheet 查詢並檢查是否存入..." -ForegroundColor Cyan
    $getResponse = Invoke-RestMethod -Uri $GasUrl -Method Get
    Write-Host "✅ 查詢成功！目前 Google Sheet 中已存入 $($getResponse.count) 筆訂單記錄：" -ForegroundColor Green
    $getResponse.data | Format-Table -AutoSize

} catch {
    Write-Host "`n❌ 發送或驗證失敗：$($_.Exception.Message)" -ForegroundColor Red
}

