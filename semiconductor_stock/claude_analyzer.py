"""
Claude API 分析モジュール
- 収集した株データをClaude APIに送り、総合分析レポートを生成します
"""

import os
import anthropic
from config import CLAUDE_MODEL
from stock_collector import format_stock_for_display


def analyze_with_claude(stock_data_list):
    """
    全銘柄のデータをClaudeに送り、分析レポートを生成する。

    Args:
        stock_data_list: collect_stock_data() の戻り値

    Returns:
        str: Claudeが生成した分析レポート(テキスト)
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "環境変数 ANTHROPIC_API_KEY が設定されていません。\n"
            ".env ファイルに ANTHROPIC_API_KEY=sk-ant-... を記入してください。"
        )

    # 全銘柄のデータをテキストにまとめる
    stock_text_blocks = []
    for stock in stock_data_list:
        stock_text_blocks.append(format_stock_for_display(stock))

    all_stocks_text = "\n\n".join(stock_text_blocks)

    # Claudeへのプロンプト
    prompt = f"""以下は半導体関連銘柄(米国+日本)の最新の株式データです。
このデータを基に、投資家向けの総合分析レポートを日本語で作成してください。

【分析に含めてほしい内容】
1. 半導体セクター全体の現況サマリー(市場トレンド)
2. 注目銘柄トップ5とその理由
3. 米国市場 vs 日本市場の比較分析
4. バリュエーション分析(PERが割安/割高な銘柄)
5. モメンタム分析(期間変化率が大きい銘柄)
6. リスク要因と注意点
7. 今後の見通し

【重要な注意事項】
- これは情報提供のみを目的としており、投資助言ではありません
- その旨をレポートの冒頭と末尾に明記してください

--- 株式データ ここから ---

{all_stocks_text}

--- 株式データ ここまで ---"""

    print("  Claude APIに分析を依頼中...")

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=4096,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )

    # レスポンスからテキストを取り出す
    report = message.content[0].text

    print("  -> 分析レポート生成完了")
    return report
