"""
半導体株 分析 & Notion アップロード メインスクリプト

使い方:
  1. .env ファイルにAPIキーを設定
  2. python main.py を実行
"""

import sys
import os

# .env ファイルから環境変数を読み込む
from dotenv import load_dotenv
load_dotenv()

from stock_collector import collect_stock_data
from claude_analyzer import analyze_with_claude
from notion_uploader import upload_to_notion


def main():
    print("=" * 60)
    print("  半導体関連銘柄 データ収集 & 分析ツール")
    print("=" * 60)

    # --- Step 1: Notion ページID の確認 ---
    notion_page_id = os.environ.get("NOTION_PAGE_ID")
    if not notion_page_id:
        print("\nエラー: NOTION_PAGE_ID が設定されていません。")
        print(".env ファイルに NOTION_PAGE_ID=xxxxxxxx を記入してください。")
        print("(取得方法は README.md を参照)")
        sys.exit(1)

    # --- Step 2: 株データ収集 ---
    print("\n[Step 1/3] 株価データを収集中...")
    stock_data = collect_stock_data()

    success_count = sum(1 for s in stock_data if "error" not in s)
    error_count = sum(1 for s in stock_data if "error" in s)
    print(f"\n  結果: {success_count}銘柄 成功 / {error_count}銘柄 エラー")

    if success_count == 0:
        print("\nエラー: 1銘柄もデータを取得できませんでした。")
        print("インターネット接続を確認してください。")
        sys.exit(1)

    # --- Step 3: Claude APIで分析 ---
    print("\n[Step 2/3] Claude APIで分析レポートを生成中...")
    try:
        report = analyze_with_claude(stock_data)
    except Exception as e:
        print(f"\nエラー: Claude API分析に失敗しました。")
        print(f"  詳細: {e}")
        sys.exit(1)

    # レポートをコンソールにも表示
    print("\n" + "-" * 60)
    print("【分析レポート プレビュー】")
    print("-" * 60)
    print(report[:1000] + "..." if len(report) > 1000 else report)
    print("-" * 60)

    # --- Step 4: Notionにアップロード ---
    print("\n[Step 3/3] Notionにアップロード中...")
    try:
        upload_to_notion(notion_page_id, stock_data, report)
    except Exception as e:
        print(f"\nエラー: Notionアップロードに失敗しました。")
        print(f"  詳細: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  完了しました!")
    print(f"  Notionページを確認してください:")
    print(f"  https://notion.so/{notion_page_id.replace('-', '')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
