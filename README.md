# Shizunari.

ゼミの研究・個人開発で制作している、静けさと本音をテーマにした思索型SNSです。

## プロジェクトの概要

現代のSNSは、いいね数やフォロワー数などの数字による評価や、刺激的なコンテンツによる過熱が起こりやすい傾向にあります。Shizunari. ではそうした数字への執着から離れ、自分の考えや本音を静かに書き留めておける場所を目指して開発しています。

日本庭園の「水琴窟」のように、静かな環境だからこそ小さな水滴の音が澄んで響くという着想から、刺激を抑えた水色と深いネイビーを基調としたUIにしています。

## 実装した主な機能

- **共感リアクションと音響演出**
  いいねボタンを押した際や投稿完了時に、水面に広がる波紋アニメーションを表示します。また、Web Audio APIを使って水琴窟のような水滴音をブラウザ側で合成・再生します。
- **環境音の再生機能**
  水琴窟、波、竹林の風、焚き火の4種類の環境音を、外部の音声ファイルを使わずにWeb Audio APIの波形合成だけで再生できるようにしています（通信量・読み込み遅延ゼロ）。
- **心の天気**
  投稿されたテキストを分析し、コミュニティ全体の感情の傾向を天気（晴れ・雨・曇り・嵐）として可視化します。
- **マイジャーナル**
  自分の過去の投稿と感情の変化をカレンダーやグラフで振り返ることができます。
- **深夜モード**
  夜間（21:00〜翌5:00）にアクセスした際、画面の眩しさを抑え、静かな思索を促すバナーを表示します。
- **AIによる思索サポート**
  日替わりで考えを深める問いを提示する機能や、Gemini APIを利用した感情分析・思索レポート、多言語翻訳を組み込んでいます。
- **多言語対応**
  日本語、英語、スペイン語、中国語の切り替えに対応しています。

## 使用技術

- フロントエンド: Next.js (App Router), React, TypeScript
- スタイリング: CSS Modules
- バックエンド / データベース: Firebase (Authentication, Cloud Firestore)
- AI / API: Google Gemini API
- 音声処理: Web Audio API
- デプロイ: Vercel

## 起動方法

### 1. 準備

```bash
git clone https://github.com/savereset302-pixel/shizunari.-sns.git
cd shizunari.-sns
npm install
```

### 2. 環境変数の設定

`.env.local` を作成し、FirebaseおよびGeminiのAPIキーを設定します。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くと動作を確認できます。
