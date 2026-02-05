"""
半導体関連銘柄の設定ファイル
- 銘柄リストやパラメータをここで管理します
"""

# ========================================
# 半導体関連銘柄リスト
# ticker: Yahoo Financeのティッカーシンボル
# name: 表示用の企業名
# market: 市場(US=米国, JP=日本)
# ========================================

SEMICONDUCTOR_STOCKS = [
    # --- 米国 主要銘柄 ---
    {"ticker": "NVDA",   "name": "NVIDIA",                "market": "US"},
    {"ticker": "AMD",    "name": "AMD",                   "market": "US"},
    {"ticker": "INTC",   "name": "Intel",                 "market": "US"},
    {"ticker": "TSM",    "name": "TSMC (ADR)",            "market": "US"},
    {"ticker": "AVGO",   "name": "Broadcom",              "market": "US"},
    {"ticker": "QCOM",   "name": "Qualcomm",              "market": "US"},
    {"ticker": "TXN",    "name": "Texas Instruments",     "market": "US"},
    {"ticker": "MU",     "name": "Micron Technology",     "market": "US"},
    {"ticker": "ASML",   "name": "ASML (ADR)",            "market": "US"},
    {"ticker": "LRCX",   "name": "Lam Research",          "market": "US"},
    {"ticker": "AMAT",   "name": "Applied Materials",     "market": "US"},
    {"ticker": "KLAC",   "name": "KLA Corporation",       "market": "US"},
    {"ticker": "MRVL",   "name": "Marvell Technology",    "market": "US"},
    {"ticker": "ON",     "name": "ON Semiconductor",      "market": "US"},
    {"ticker": "ARM",    "name": "Arm Holdings (ADR)",    "market": "US"},

    # --- 日本 主要銘柄 (Yahoo Financeでは .T を付ける) ---
    {"ticker": "6723.T", "name": "ルネサスエレクトロニクス",  "market": "JP"},
    {"ticker": "8035.T", "name": "東京エレクトロン",          "market": "JP"},
    {"ticker": "6857.T", "name": "アドバンテスト",            "market": "JP"},
    {"ticker": "6920.T", "name": "レーザーテック",            "market": "JP"},
    {"ticker": "4063.T", "name": "信越化学工業",              "market": "JP"},
    {"ticker": "6146.T", "name": "ディスコ",                  "market": "JP"},
    {"ticker": "6526.T", "name": "ソシオネクスト",            "market": "JP"},
    {"ticker": "6963.T", "name": "ローム",                    "market": "JP"},
    {"ticker": "6981.T", "name": "村田製作所",                "market": "JP"},
    {"ticker": "7735.T", "name": "SCREENホールディングス",    "market": "JP"},
]

# 株価データの取得期間
STOCK_DATA_PERIOD = "6mo"  # 過去6ヶ月 (1mo, 3mo, 6mo, 1y, 2y, 5y, max)

# Claude APIの分析で使うモデル
CLAUDE_MODEL = "claude-sonnet-4-20250514"
