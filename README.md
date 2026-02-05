# projects

## 半導体株 分析 & Notion アップロードツール

半導体関連銘柄(米国+日本)の株価データを自動収集し、Claude AIで分析レポートを生成して、Notionページにアップロードするツールです。

### できること

- 米国15銘柄 + 日本10銘柄の半導体関連株データを自動収集
- 現在値・変化率・PER・時価総額などを一括取得
- Claude APIで総合分析レポートを自動生成
- Notionページにテーブル付きで自動アップロード

---

### セットアップ手順 (初心者向け・ステップバイステップ)

#### 前提条件

- Python 3.9 以上がインストールされていること
- VS Code がインストールされていること

> Python がまだの場合: https://www.python.org/downloads/ からダウンロード
> インストール時に「Add Python to PATH」にチェックを入れてください

---

#### Step 1: このリポジトリをダウンロード

VS Code のターミナル (Ctrl + `) を開いて以下を実行:

```bash
git clone https://github.com/あなたのユーザー名/projects.git
cd projects/semiconductor_stock
```

#### Step 2: ライブラリをインストール

```bash
pip install -r requirements.txt
```

#### Step 3: APIキーを設定

1. `.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

2. VS Code で `.env` ファイルを開き、3つの値を入力:

```
ANTHROPIC_API_KEY=sk-ant-あなたのキー
NOTION_API_KEY=secret_あなたのキー
NOTION_PAGE_ID=あなたのページID
```

---

### APIキーの取得方法

#### Anthropic (Claude) API キー

1. https://console.anthropic.com/ にアクセス
2. アカウントを作成 or ログイン
3. 左メニューの「API Keys」をクリック
4. 「Create Key」でキーを作成
5. `sk-ant-...` で始まるキーをコピー

#### Notion API キー (Integration Token)

1. https://www.notion.so/my-integrations にアクセス
2. 「新しいインテグレーション」をクリック
3. 名前を入力 (例: 「半導体株レポート」)
4. 「送信」をクリック
5. 「Internal Integration Secret」の `secret_...` をコピー

#### Notion ページ ID の取得方法

1. Notion で **新しい空のページ** を作成
2. そのページの右上「...」→「リンクをコピー」
3. URLは次のような形式です:
   ```
   https://www.notion.so/ページ名-abc123def456...
   ```
4. URL末尾の **32文字の英数字** がページIDです
   - 例: `abc123def456789012345678abcdef12`
5. この32文字を `.env` の `NOTION_PAGE_ID` に貼り付け

#### Notion ページにインテグレーションを接続 (重要!)

1. 作成したNotionページを開く
2. 右上の「...」メニューをクリック
3. 「接続」→「コネクトの追加」を選択
4. Step 2 で作った「半導体株レポート」を選択
5. 「確認」をクリック

> これを忘れるとアップロード時にエラーになります!

---

### 実行方法

VS Code のターミナルで:

```bash
cd semiconductor_stock
python main.py
```

正常に動くと以下のように表示されます:

```
============================================================
  半導体関連銘柄 データ収集 & 分析ツール
============================================================

[Step 1/3] 株価データを収集中...
  取得中: NVIDIA (NVDA) ...
  -> 完了: NVIDIA
  取得中: AMD (AMD) ...
  ...

[Step 2/3] Claude APIで分析レポートを生成中...
  -> 分析レポート生成完了

[Step 3/3] Notionにアップロード中...
  -> Notionページへのアップロード完了

============================================================
  完了しました!
============================================================
```

---

### 銘柄を追加・変更したい場合

`config.py` を開いて `SEMICONDUCTOR_STOCKS` リストを編集してください:

```python
# 追加例: ソニーグループ
{"ticker": "6758.T", "name": "ソニーグループ", "market": "JP"},

# 追加例: TSMC (台湾市場)
{"ticker": "2330.TW", "name": "TSMC", "market": "TW"},
```

ティッカーシンボルは https://finance.yahoo.com/ で検索できます。

---

### トラブルシューティング

| エラー | 原因と対処 |
|--------|-----------|
| `ModuleNotFoundError: No module named 'yfinance'` | `pip install -r requirements.txt` を再実行 |
| `ANTHROPIC_API_KEY が設定されていません` | `.env` ファイルの作成・記入を確認 |
| `NOTION_PAGE_ID が設定されていません` | `.env` ファイルにページIDを記入 |
| `Notionブロック追加に失敗 (status=403)` | Notionページにインテグレーションを接続していない |
| `Notionブロック追加に失敗 (status=404)` | ページIDが間違っている |

---

### ファイル構成

```
semiconductor_stock/
├── .env.example       ... APIキーのテンプレート
├── .env               ... 実際のAPIキー (自分で作成・Gitには上がらない)
├── .gitignore         ... Gitに含めないファイルの指定
├── config.py          ... 銘柄リスト・設定
├── stock_collector.py ... 株データ収集
├── claude_analyzer.py ... Claude APIで分析
├── notion_uploader.py ... Notionにアップロード
├── main.py            ... メインスクリプト (これを実行)
└── requirements.txt   ... 必要ライブラリ一覧
```

### 注意事項

- 本ツールは情報提供のみを目的としており、投資助言ではありません
- `.env` ファイルにはAPIキーが含まれるため、絶対に他人と共有しないでください
- 株データは Yahoo Finance から取得しており、リアルタイムではなく遅延データです
