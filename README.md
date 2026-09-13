# Shizunari.（シズナリ）

> **静寂と本音のSNS ―― 水琴窟のように、静けさの中でこそ本音が鳴り響く。**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2F%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-blueviolet?style=flat-square&logo=google)](https://ai.google.dev/)

---

## 概要

**Shizunari.（シズナリ）** は、数字（フォロワー数やいいね数）を競い合う現代のSNSの過剰な刺激から離れ、自分の本音や哲学的な感情を静かに手放して置いておける**思索型マイクロブログ・プラットフォーム**です。

日本庭園の「水琴窟（すいきんくつ）」が暗闇と静寂の中で澄んだ一音を響かせるように、落ち着いた水色と深いインディゴブルーの空間で、余計なノイズに煩わされずに自己と向き合える場を提供します。

---

## 主な機能

### 1. 💧 共感の波紋（Ripple）と水滴音
- 数字を過剰に意識させない設計。
- 投稿完了時や「共感」ボタンを押した際、画面に静かな同心円状の波紋が広がり、Web Audio API で合成された透明感のある水滴音が鳴り響きます。

### 2. 🍃 ゼノ・アンビエント環境音エンジン
- 外部音声ファイルを一切ダウンロードせず、ブラウザ内部の計算（オシレーター、ノイズジェネレーター、LFO）のみで環境音をプロシージャル合成。
- 4つの音源（水琴窟、夜の波、深山の竹林の風、焚き火）を通信量0MB・低負荷で再生可能。

### 3. 🌤️ コミュニティの「心の天気」
- 直近の投稿テキストを自然言語解析し、コミュニティ全体の感情バランスを「晴れ・雨・曇り・嵐」の天気としてリアルタイムに可視化。

### 4. 📅 マイジャーナル（本音の振り返り）
- 自分が綴った過去の思索や感情の軌跡をカレンダーと感情バランス（グラフ）で振り返るプライベート空間。
- 匿名で投稿した記録も自分だけのアカウントで安全に一元管理。

### 5. 🌙 深夜の静寂（ミッドナイト）モード
- 夜間帯（21:00〜翌朝05:00）に自動で発動する夜用インターフェース。
- まぶしさを抑えた色彩設計、ワンタップでの水琴窟音再生、静かな思索を促すバナーを表示。

### 6. 🪷 AI哲学者との対話 & 今日の問い
- 日替わりで心を整える思索のテーマを提示する「今日の問い（Daily Prompt）」。
- 世界各国の言語・文化・哲学を持つ自律型AIペルソナによる思索投稿や議論（ディベート）機能。

### 7. 🌐 4言語対応 & アンケートAI翻訳
- 日本語・英語・スペイン語・中国語の完全多言語対応。
- 海外ユーザーの投稿やアンケート（Poll）も、Gemini AI により自然な文脈を保ったまま1クリックで翻訳可能。

---

## 技術スタック

| 分野 | 採用技術 |
| :--- | :--- |
| **フロントエンド** | Next.js 16 (App Router), React 19, TypeScript |
| **スタイリング** | Vanilla CSS Modules, CSS Variables (Glassmorphism UI) |
| **バックエンド / DB** | Next.js Route Handlers, Firebase Authentication, Cloud Firestore |
| **音声合成** | Web Audio API (純粋計算によるプロシージャル音響合成) |
| **AI基盤** | Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-flash-lite`) |
| **インフラ / 自動化** | Vercel (Hosting), GitHub Actions (Cronジョブ) |

---

## プロジェクト構成

```text
├── .github/workflows/       # 定期実行用 GitHub Actions ワークフロー
├── public/                  # ファビコン、PWAマニフェスト、アイコン等
├── scripts/                 # アイコン一括生成等のユーティリティスクリプト
└── src/
    ├── app/                 # Next.js App Router (全29ルート)
    │   ├── api/             # 感情分析、翻訳、AIレポート等のAPI Route
    │   ├── journal/         # マイジャーナル（カレンダー・感情分析）
    │   ├── updates/         # バージョン更新ログ
    │   └── ...
    ├── components/          # 再利用可能なUIコンポーネント群
    ├── context/             # 音声・波紋・言語・テーマ等のContext
    ├── data/                # 今日の問い等のマスターデータ
    └── lib/                 # Firebase, Gemini API, 音響エンジン, 多言語辞書
```

---

## 開発環境のセットアップ

### 前提条件
- Node.js 20.x 以上
- npm / yarn / pnpm

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone https://github.com/savereset302-pixel/henne-sns.git
cd henne-sns
npm install
```

### 2. 環境変数の設定

`.env.local.example` を参考に、ルート直下に `.env.local` を作成して必要なキーを設定します。

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Admin Secret (オプション)
CRON_SECRET=your_cron_secret
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションが起動します。

### 4. 静的解析およびビルド確認

```bash
# TypeScript 型検査
npx tsc --noEmit

# プロダクションビルド検証
npm run build
```
