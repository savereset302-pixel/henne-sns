# Shizunari - 静寂と本音のSNS

現代のSNSに見られる「いいね数やフォロワー数の過剰な可視化」や「即時的な反応へのプレッシャー」から離れ、自分の本音や考えを静かに書き残すためのWebアプリケーションです。

日本庭園の「水琴窟（すいきんくつ）」のように、落ち着いた静かな空間の中で自己の感情と向き合える場を目指して制作しました。

## 主な機能

- **投稿と共感（波紋エフェクト）**
  数字を競い合わせないよう、投稿や共感のアクション時に画面へ波紋が広がり、澄んだ水滴音が鳴る設計にしています。
- **環境音の合成・再生**
  外部の音声ファイルをダウンロードせず、ブラウザのWeb Audio API（オシレーター・ノイズ処理）を用いて、水琴窟・夜の波・竹林の風・焚き火の4種類の環境音をリアルタイムにプロシージャル合成します。
- **感情の可視化と振り返り（マイジャーナル）**
  投稿テキストの感情分析結果をもとにコミュニティ全体の傾向を「心の天気」として表示するほか、過去の自分の投稿や感情の推移をカレンダーで振り返ることができます。
- **思索プロンプトとAI連携**
  日替わりで思索のきっかけとなる問いかけ（今日の問い）を表示するほか、Gemini APIを利用したAI哲学者との対話や、投稿・アンケートの多言語翻訳に対応しています。
- **深夜の静寂モード**
  夜間（21:00〜翌5:00）のアクセス時に画面の刺激を抑え、静かな思索を促すバナーと水音の再生ショートカットを表示します。

## 使用技術

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript, CSS Modules
- **バックエンド / データベース**: Firebase Authentication, Cloud Firestore, Next.js API Routes
- **音響処理**: Web Audio API
- **AI連携**: Google Gemini API (gemini-2.5-flash)
- **インフラ**: Vercel

## 起動方法

### 1. パッケージのインストール
```bash
npm install
```

### 2. 環境変数の設定
ルートディレクトリに `.env.local` を作成し、必要な環境変数を設定します。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くと動作を確認できます。
