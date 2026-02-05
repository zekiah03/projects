"""
株データ収集モジュール
- yfinance を使って半導体関連銘柄の情報を取得します
"""

import yfinance as yf
from config import SEMICONDUCTOR_STOCKS, STOCK_DATA_PERIOD


def collect_stock_data():
    """
    全銘柄の株価データ・企業情報を収集して返す。

    Returns:
        list[dict]: 各銘柄のデータを辞書のリストで返す
    """
    all_data = []

    for stock_info in SEMICONDUCTOR_STOCKS:
        ticker = stock_info["ticker"]
        name = stock_info["name"]
        market = stock_info["market"]

        print(f"  取得中: {name} ({ticker}) ...")

        try:
            data = _fetch_single_stock(ticker, name, market)
            all_data.append(data)
            print(f"  -> 完了: {name}")
        except Exception as e:
            print(f"  -> エラー: {name} - {e}")
            all_data.append({
                "ticker": ticker,
                "name": name,
                "market": market,
                "error": str(e),
            })

    return all_data


def _fetch_single_stock(ticker, name, market):
    """1銘柄分のデータを取得する"""
    tk = yf.Ticker(ticker)

    # --- 企業情報 ---
    info = tk.info or {}

    # --- 株価履歴 (期間はconfigで指定) ---
    hist = tk.history(period=STOCK_DATA_PERIOD)

    # 直近の株価
    current_price = info.get("currentPrice") or info.get("regularMarketPrice")
    previous_close = info.get("previousClose")

    # 期間中の高値・安値
    period_high = round(float(hist["High"].max()), 2) if not hist.empty else None
    period_low = round(float(hist["Low"].min()), 2) if not hist.empty else None

    # 期間中の出来高平均
    avg_volume = int(hist["Volume"].mean()) if not hist.empty else None

    # 期間最初と最後の終値で変化率を計算
    if not hist.empty and len(hist) >= 2:
        start_price = float(hist["Close"].iloc[0])
        end_price = float(hist["Close"].iloc[-1])
        period_change_pct = round((end_price - start_price) / start_price * 100, 2)
    else:
        period_change_pct = None

    # 通貨の設定
    currency = "JPY" if market == "JP" else "USD"

    return {
        "ticker": ticker,
        "name": name,
        "market": market,
        "currency": currency,
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "current_price": current_price,
        "previous_close": previous_close,
        "period_high": period_high,
        "period_low": period_low,
        "period_change_pct": period_change_pct,
        "avg_volume": avg_volume,
        "market_cap": info.get("marketCap"),
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "dividend_yield": info.get("dividendYield"),
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
        "summary": info.get("longBusinessSummary", "N/A"),
    }


def format_stock_for_display(stock):
    """1銘柄のデータを表示用テキストに変換する"""
    if "error" in stock:
        return f"[{stock['name']} ({stock['ticker']})]: データ取得エラー - {stock['error']}"

    currency_symbol = "¥" if stock["currency"] == "JPY" else "$"

    lines = [
        f"■ {stock['name']} ({stock['ticker']}) - {stock['market']}市場",
        f"  現在値: {currency_symbol}{stock['current_price']}",
        f"  前日終値: {currency_symbol}{stock['previous_close']}",
        f"  期間高値: {currency_symbol}{stock['period_high']}",
        f"  期間安値: {currency_symbol}{stock['period_low']}",
        f"  期間変化率: {stock['period_change_pct']}%",
        f"  平均出来高: {stock['avg_volume']:,}" if stock['avg_volume'] else "  平均出来高: N/A",
        f"  時価総額: {_format_market_cap(stock['market_cap'], stock['currency'])}",
        f"  PER (実績): {stock['pe_ratio']}",
        f"  PER (予想): {stock['forward_pe']}",
        f"  配当利回り: {round(stock['dividend_yield'] * 100, 2)}%" if stock['dividend_yield'] else "  配当利回り: N/A",
        f"  52週高値: {currency_symbol}{stock['fifty_two_week_high']}",
        f"  52週安値: {currency_symbol}{stock['fifty_two_week_low']}",
        f"  セクター: {stock['sector']}",
        f"  業種: {stock['industry']}",
    ]
    return "\n".join(lines)


def _format_market_cap(market_cap, currency):
    """時価総額を読みやすい形式にする"""
    if not market_cap:
        return "N/A"

    if currency == "JPY":
        # 日本円: 億円表示
        oku = market_cap / 100_000_000
        if oku >= 10000:
            return f"約{oku / 10000:.1f}兆円"
        return f"約{oku:,.0f}億円"
    else:
        # USD: Billion表示
        if market_cap >= 1_000_000_000_000:
            return f"${market_cap / 1_000_000_000_000:.2f}T"
        if market_cap >= 1_000_000_000:
            return f"${market_cap / 1_000_000_000:.2f}B"
        return f"${market_cap / 1_000_000:.2f}M"
