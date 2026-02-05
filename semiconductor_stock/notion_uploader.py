"""
Notion アップロードモジュール
- 分析レポートと個別銘柄データをNotionページに書き込みます
"""

import os
import requests
from datetime import datetime


NOTION_API_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def get_headers():
    """Notion API用のヘッダーを返す"""
    token = os.environ.get("NOTION_API_KEY")
    if not token:
        raise ValueError(
            "環境変数 NOTION_API_KEY が設定されていません。\n"
            ".env ファイルに NOTION_API_KEY=secret_... を記入してください。"
        )
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
    }


def upload_to_notion(page_id, stock_data_list, analysis_report):
    """
    Notionページに分析レポートと銘柄データを書き込む。

    Args:
        page_id: 書き込み先のNotionページID
        stock_data_list: 株データのリスト
        analysis_report: Claude生成の分析レポート
    """
    headers = get_headers()

    # まずページタイトルを更新
    _update_page_title(headers, page_id)

    # ページの中身(ブロック)を追加
    blocks = _build_blocks(stock_data_list, analysis_report)

    # Notion APIは1回のリクエストで最大100ブロックまで
    # 100個ずつに分割して送信
    for i in range(0, len(blocks), 100):
        chunk = blocks[i:i + 100]
        _append_blocks(headers, page_id, chunk)

    print(f"  -> Notionページへのアップロード完了")
    print(f"     https://notion.so/{page_id.replace('-', '')}")


def _update_page_title(headers, page_id):
    """ページタイトルを更新"""
    today = datetime.now().strftime("%Y-%m-%d")
    url = f"{NOTION_API_URL}/pages/{page_id}"

    payload = {
        "properties": {
            "title": {
                "title": [
                    {
                        "text": {
                            "content": f"半導体株 分析レポート ({today})"
                        }
                    }
                ]
            }
        }
    }

    resp = requests.patch(url, headers=headers, json=payload)
    if resp.status_code != 200:
        print(f"  警告: タイトル更新に失敗 (status={resp.status_code})")
        print(f"  レスポンス: {resp.text[:300]}")


def _append_blocks(headers, page_id, blocks):
    """ブロックをページに追加"""
    url = f"{NOTION_API_URL}/blocks/{page_id}/children"
    payload = {"children": blocks}

    resp = requests.patch(url, headers=headers, json=payload)
    if resp.status_code != 200:
        raise RuntimeError(
            f"Notionブロック追加に失敗 (status={resp.status_code})\n"
            f"レスポンス: {resp.text[:500]}"
        )


def _build_blocks(stock_data_list, analysis_report):
    """Notionに追加するブロック群を組み立てる"""
    blocks = []
    today = datetime.now().strftime("%Y年%m月%d日 %H:%M")

    # --- ヘッダー ---
    blocks.append(_heading1("半導体関連銘柄 総合分析レポート"))
    blocks.append(_paragraph(f"作成日時: {today}"))
    blocks.append(_divider())

    # --- 分析レポート ---
    blocks.append(_heading2("Claude AI による総合分析"))

    # レポートを段落ごとに分割して追加
    # (Notionの1ブロックは最大2000文字なので分割する)
    report_paragraphs = analysis_report.split("\n\n")
    for para in report_paragraphs:
        para = para.strip()
        if not para:
            continue
        # 2000文字を超える場合はさらに分割
        for chunk in _split_text(para, 2000):
            blocks.append(_paragraph(chunk))

    blocks.append(_divider())

    # --- 個別銘柄データ (テーブル形式) ---
    blocks.append(_heading2("個別銘柄データ一覧"))

    # 米国株
    us_stocks = [s for s in stock_data_list if s.get("market") == "US" and "error" not in s]
    if us_stocks:
        blocks.append(_heading3("米国市場"))
        blocks.extend(_build_stock_table(us_stocks, "USD"))

    # 日本株
    jp_stocks = [s for s in stock_data_list if s.get("market") == "JP" and "error" not in s]
    if jp_stocks:
        blocks.append(_heading3("日本市場"))
        blocks.extend(_build_stock_table(jp_stocks, "JPY"))

    # エラー銘柄
    error_stocks = [s for s in stock_data_list if "error" in s]
    if error_stocks:
        blocks.append(_heading3("データ取得エラー"))
        for s in error_stocks:
            blocks.append(_paragraph(f"{s['name']} ({s['ticker']}): {s['error']}"))

    blocks.append(_divider())
    blocks.append(_paragraph("※ 本レポートは情報提供のみを目的としており、投資助言ではありません。"))

    return blocks


def _build_stock_table(stocks, currency):
    """銘柄リストからNotionテーブルブロックを作る"""
    blocks = []

    # テーブルヘッダー
    currency_label = "円" if currency == "JPY" else "USD"
    header_row = [
        "銘柄", f"現在値({currency_label})", f"期間高値", f"期間安値",
        "変化率(%)", "PER", "時価総額"
    ]
    table_width = len(header_row)

    rows = [header_row]

    for s in stocks:
        price = str(s.get("current_price", "N/A"))
        high = str(s.get("period_high", "N/A"))
        low = str(s.get("period_low", "N/A"))
        change = str(s.get("period_change_pct", "N/A"))
        pe = str(round(s["pe_ratio"], 1)) if s.get("pe_ratio") else "N/A"
        mcap = _format_market_cap_short(s.get("market_cap"), currency)

        rows.append([
            f"{s['name']} ({s['ticker']})",
            price, high, low, change, pe, mcap
        ])

    # Notionテーブルブロック
    table_block = {
        "type": "table",
        "table": {
            "table_width": table_width,
            "has_column_header": True,
            "has_row_header": False,
            "children": []
        }
    }

    for row in rows:
        table_row = {
            "type": "table_row",
            "table_row": {
                "cells": [
                    [{"type": "text", "text": {"content": cell}}]
                    for cell in row
                ]
            }
        }
        table_block["table"]["children"].append(table_row)

    blocks.append(table_block)
    return blocks


# ========================================
# Notion ブロック生成ヘルパー
# ========================================

def _heading1(text):
    return {
        "type": "heading_1",
        "heading_1": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        }
    }


def _heading2(text):
    return {
        "type": "heading_2",
        "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        }
    }


def _heading3(text):
    return {
        "type": "heading_3",
        "heading_3": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        }
    }


def _paragraph(text):
    return {
        "type": "paragraph",
        "paragraph": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        }
    }


def _divider():
    return {"type": "divider", "divider": {}}


def _split_text(text, max_len):
    """テキストをmax_len文字ごとに分割"""
    if len(text) <= max_len:
        return [text]
    chunks = []
    while text:
        chunks.append(text[:max_len])
        text = text[max_len:]
    return chunks


def _format_market_cap_short(market_cap, currency):
    """時価総額を短い形式で返す"""
    if not market_cap:
        return "N/A"
    if currency == "JPY":
        oku = market_cap / 100_000_000
        if oku >= 10000:
            return f"{oku / 10000:.1f}兆円"
        return f"{oku:,.0f}億円"
    else:
        if market_cap >= 1_000_000_000_000:
            return f"${market_cap / 1_000_000_000_000:.1f}T"
        if market_cap >= 1_000_000_000:
            return f"${market_cap / 1_000_000_000:.1f}B"
        return f"${market_cap / 1_000_000:.1f}M"
