# TWIN WORLD

リアルタイムWebゲーム。Canvas2Dベースの描画エンジンとSupabase Realtimeによるマルチプレイヤー基盤。

## Tech Stack

- **Frontend**: React 19 + TypeScript 6 + Vite 8
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Vercel (`solnova.biz`)
- **CI/CD**: GitHub Actions → Vercel

## Project Structure

```
twin-world/
├── supabase/migrations/   # SQLマイグレーション（Supabase SQL Editorで実行）
├── src/
│   ├── lib/               # 外部サービス接続
│   │   ├── supabase.ts    #   Supabaseクライアント（型付き）
│   │   └── websocket.ts   #   RealtimeManager（broadcast送受信）
│   ├── types/             # 型定義
│   │   ├── database.ts    #   DBスキーマ型（Supabase生成形式）
│   │   └── engine.ts      #   IRenderEngine, IInputHandler, GameObject等
│   ├── engine/            # 描画エンジン
│   │   ├── RenderEngine.ts #  Canvas2D実装（IRenderEngine準拠）
│   │   └── GameCanvas.tsx  #  Reactラッパーコンポーネント
│   ├── features/          # 機能単位モジュール
│   │   ├── auth/          #   認証（AuthProvider, LoginForm, useAuth）
│   │   └── upload/        #   JSONアップロード → game_dataテーブル
│   ├── pages/             # ページコンポーネント
│   ├── components/        # 共有UIコンポーネント（今後追加）
│   ├── App.tsx            # ルート（認証状態で AuthPage / GamePage 切替）
│   └── main.tsx           # エントリポイント
├── vercel.json            # Vercelデプロイ設定
└── .env.example           # 環境変数テンプレート
```

## DB Schema (Supabase)

| テーブル | 用途 |
|----------|------|
| `profiles` | ユーザープロフィール（auth.users連動、自動作成） |
| `game_data` | JSONデータ保存（jsonb型、data_typeで分類） |
| `game_sessions` | ゲームセッション管理（waiting/active/finished） |
| `session_players` | セッション参加者 |

全テーブルRLS有効。`updated_at` は自動更新トリガー付き。

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # tsc + vite build
npm run preview  # ビルド成果物のプレビュー
```

## Key Interfaces

### IRenderEngine (`src/types/engine.ts`)
ゲーム描画エンジンの抽象インターフェース。
- `init(canvas)` / `destroy()` — ライフサイクル
- `addObject()` / `removeObject()` / `updateObject()` — オブジェクト管理
- `setCamera()` / `getCamera()` — カメラ制御
- `start()` / `stop()` / `render()` — 描画ループ

### RealtimeManager (`src/lib/websocket.ts`)
Supabase Realtimeのbroadcastチャネルラッパー。
- `connect(sessionId)` — チャネル接続
- `send(event, payload)` — イベント送信
- `on(event, handler)` — リスナー登録（unsubscribe関数を返す）
- `disconnect()` — 切断

## Conventions

- パスエイリアス: `@/` → `src/`
- 機能追加は `src/features/<name>/` にディレクトリを作る
- 新しいページは `src/pages/` に追加
- DB型定義の変更は `src/types/database.ts` を手動更新（将来的にsupabase gen typesに移行）
- コンポーネントは named export を使う（default export は App.tsx のみ）
- スタイルはインラインオブジェクト or CSS Modules（CSS-in-JSライブラリは未導入）

## Environment Variables

| 変数 | 説明 |
|------|------|
| `VITE_SUPABASE_URL` | SupabaseプロジェクトURL |
| `VITE_SUPABASE_ANON_KEY` | Supabase匿名キー |
| `VITE_APP_URL` | 本番URL (`https://solnova.biz`) |
