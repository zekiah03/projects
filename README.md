# 半導体株データ自動収集 → Notion投稿パイプライン

n8n (セルフホスト) を使用して、半導体関連株の情報を自動収集し、Claude APIで分析した上でNotionデータベースにアップロードするワークフロー。

## アーキテクチャ

```
[Schedule Trigger (毎日18時)]
        ↓
[銘柄リスト定義 (米国17銘柄 + 日本10銘柄)]
        ↓
[Yahoo Finance API → 株価データ取得]
        ↓
[データ集約・整形]
        ↓
[Claude API → セクター分析レポート生成]
        ↓
[Notion API → データベースにページ作成]
```

## 対象銘柄

### 米国半導体株
| ティッカー | 企業名 | カテゴリ |
|---|---|---|
| NVDA | NVIDIA | GPU/AI半導体 |
| AMD | AMD | CPU/GPU |
| INTC | Intel | CPU/ファウンドリ |
| TSM | TSMC (ADR) | ファウンドリ |
| AVGO | Broadcom | 通信/インフラ半導体 |
| QCOM | Qualcomm | モバイル半導体 |
| TXN | Texas Instruments | アナログ半導体 |
| MU | Micron Technology | メモリ |
| ASML | ASML (ADR) | 半導体製造装置 |
| LRCX | Lam Research | 半導体製造装置 |
| KLAC | KLA Corporation | 半導体検査装置 |
| AMAT | Applied Materials | 半導体製造装置 |
| MRVL | Marvell Technology | データインフラ半導体 |
| ON | ON Semiconductor | パワー半導体 |
| NXPI | NXP Semiconductors | 車載半導体 |
| ARM | Arm Holdings (ADR) | IPコア/設計 |
| SMCI | Super Micro Computer | AIサーバー |

### 日本半導体株
| ティッカー | 企業名 | カテゴリ |
|---|---|---|
| 8035.T | 東京エレクトロン | 半導体製造装置 |
| 6857.T | アドバンテスト | 半導体検査装置 |
| 6920.T | レーザーテック | 半導体検査装置 |
| 6723.T | ルネサスエレクトロニクス | 車載/産業半導体 |
| 4063.T | 信越化学工業 | シリコンウエハー |
| 6526.T | ソシオネクスト | SoC設計 |
| 6146.T | ディスコ | 半導体切断/研磨装置 |
| 6963.T | ローム | パワー半導体 |
| 6981.T | 村田製作所 | 電子部品 |
| 6594.T | 日本電産(ニデック) | モーター/電子部品 |

## 前提条件

- Docker / Docker Compose
- Anthropic API キー
- Notion API キー (Integration Token)
- Notion データベース (下記手順で作成)

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、以下の値を設定:

```
ANTHROPIC_API_KEY=sk-ant-...
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...
N8N_BASIC_AUTH_PASSWORD=<安全なパスワード>
POSTGRES_PASSWORD=<DBパスワード>
```

### 2. Notion データベースの作成

#### 2-1. Notion Integrationの作成

1. https://www.notion.so/my-integrations にアクセス
2. 「新しいインテグレーション」をクリック
3. 名前を入力（例: `半導体株レポート`）
4. 関連するワークスペースを選択
5. 機能で「コンテンツを読み取る」「コンテンツを挿入」「コンテンツを更新」を有効化
6. 「送信」してAPIキー（`secret_...`）をコピー

#### 2-2. Notionデータベースの作成

Notionで新しいデータベース（テーブル）を作成し、以下のプロパティを追加:

| プロパティ名 | 型 |
|---|---|
| タイトル | タイトル (デフォルト) |
| 日付 | 日付 |
| 市場トレンド | セレクト (選択肢: 上昇, 下降, 横ばい) |
| 銘柄数 | 数値 |

#### 2-3. データベースIDの取得

データベースページのURLからIDを取得:
```
https://www.notion.so/<DATABASE_ID>?v=...
                      ^^^^^^^^^^^^^^^^
                      この部分がデータベースID
```

#### 2-4. Integrationの接続

データベースページ右上の「...」→「接続」→ 作成したIntegrationを選択

### 3. n8nの起動

```bash
docker compose up -d
```

ブラウザで http://localhost:5678 にアクセスし、`.env` で設定したユーザー名/パスワードでログイン。

### 4. ワークフローのインポート

1. n8nの画面左上メニュー → 「ワークフロー」
2. 右上の「...」→「ファイルからインポート」
3. `n8n-workflows/semiconductor_stock_pipeline.json` を選択
4. インポート完了後、ワークフローが表示される

### 5. 動作確認

1. ワークフロー画面で「テスト実行」ボタンをクリック
2. 各ノードが順次実行され、最終的にNotionにページが作成されることを確認
3. 問題なければ、右上の「Active」トグルをONにして自動実行を有効化

## ワークフローの流れ

1. **毎日18時に実行** - スケジュールトリガー（JST 18:00 = 日米市場終了後）
2. **半導体銘柄リスト定義** - 27銘柄のティッカーシンボルと属性を出力
3. **バッチ処理** - 5銘柄ずつ処理（API制限対策）
4. **Yahoo Finance API取得** - 各銘柄の1ヶ月間チャートデータを取得
5. **株価データ整形** - 現在値、日次変動率、月間高安、平均出来高を抽出
6. **レート制限対策** - API間に1.5秒の待機
7. **全銘柄データ集約** - 全銘柄のデータを1つのレポートに統合
8. **Claude API分析** - Claude に包括的な分析レポートの生成を依頼
9. **Notionページ構築** - Notion API用のペイロードを構築
10. **Notionページ作成** - データベースに新規ページとしてアップロード

## Claude による分析内容

- セクター全体の概況（トレンド判定）
- 注目銘柄トップ5とその理由
- カテゴリ別分析（GPU/AI、メモリ、製造装置、パワー半導体等）
- 日米市場の比較
- リスク要因
- 今後1-2週間の注目ポイント

## カスタマイズ

### 銘柄の追加・削除

`半導体銘柄リスト定義` ノードのコードを編集して、`stocks` 配列に銘柄を追加/削除できます。

### スケジュールの変更

`毎日18時に実行` ノードのパラメータで実行時間を変更できます。

### 分析プロンプトの変更

`Claude API分析` ノードのリクエストボディ内のプロンプトを編集することで、分析の観点やフォーマットをカスタマイズできます。

## トラブルシューティング

| 問題 | 対処法 |
|---|---|
| Yahoo Finance APIエラー | User-Agentヘッダーが設定されているか確認。レート制限の場合はWait時間を延長 |
| Claude APIエラー | APIキーの有効性と残高を確認。タイムアウトの場合は`max_tokens`を減らす |
| Notionページ作成失敗 | データベースIDの正確性、Integrationの接続、プロパティ名の一致を確認 |
| n8nが起動しない | `docker compose logs n8n` でログを確認。PostgreSQLの起動を待っているか確認 |

## 停止

```bash
docker compose down
```

データを含めて完全に削除する場合:
```bash
docker compose down -v
```
