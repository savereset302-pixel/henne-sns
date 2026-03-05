"use client";

import Link from "next/link";
import styles from "../privacy/legal.module.css";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";

export default function UpdatesPage() {
    const { t } = useLanguage();

    // Using keys for localized content where available, otherwise fallback
    const updates = [
        {
            date: "2026-03-05",
            title: "v3.0: 心の深淵を映す（AI思索レポート・感情天気・対話）",
            items: [
                "「AI思索レポート」実装。過去7日間の投稿をAIが哲学的に分析（プロフィールから）",
                "「今の心の天気」機能をホームに統合。サイト全体の感情傾向をリアルタイム反映",
                "「一期一会の対話 (Dialogue)」機能を追加。1対1の匿名チャットで深い交流を",
                "多言語翻訳の拡充（スペイン語・中国語の完全対応）",
                "Gemini AI モデルを最新（2.5 Flash）に統一し、分析精度を向上"
            ]
        },
        {
            date: "2026-03-02",
            title: "v2.8: 安定性の向上とUIの最適化（共有機能修正・ボタン表示改善）",
            items: [
                "共有ボタンでコピーされるURLの不備を修正（404エラーの解消）",
                "全ボタンのテキストがデバイスサイズによって不自然に改行される問題を修正",
                "モバイル環境での操作性と視認性をさらに向上"
            ]
        },
        {
            date: "2026-03-02",
            title: "v2.7: さらなる使いやすさと繋がり（検索・公開プロフ・404修正）",
            items: [
                "記事検索機能を実装。キーワードで気になる本音を素早く見つけられます",
                "ユーザープロフィールページを新設。過去の投稿（非匿名）やBioを確認可能に",
                "投稿者名・コメント投稿者名からのプロフィールリンク機能を追加",
                "「詳しく読む」ボタンのリンク不備（404エラー）を修正",
                "新フォント「まる文字」「遊び心」を追加。より自由な表現が可能に"
            ]
        },
        {
            date: "2026-03-02",
            title: "v2.6: つながりと対話の強化（投票・プロフィール・共有）",
            items: [
                "投票（アンケート）機能の実装。みんなの意見を匿名で収集可能に",
                "プロフィールに「ひとこと（Bio）」設定を追加。自分を緩やかに表現できます",
                "記事共有ボタンを追加。URLをワンタップでクリップボードにコピー",
                "モバイル表示の最適化。詳しく読むボタンの文字崩れを修正",
                "AIコメントの重複防止ロジックの導入と、モデルの最新化"
            ]
        },
        {
            date: "2026-03-01",
            title: "v2.3: 感情の整理と彩りの追加",
            items: [
                "「感情フィルタ」をホーム画面に実装。今の気分に合った本音を絞り込めます",
                "4つの新カラーテーマ（深海、夕暮れ、ラベンダー、禅）を追加",
                "感情分析AIの安定性を大幅に向上（Gemini 2.5 Flashへの移行）",
                "画像投稿時の通信エラー（CORS）の特定と改善策の導入"
            ]
        },
        {
            date: "2026-02-23",
            title: t("update_v21_title") || "v2.1: 高速化とグローバル展開の完成",
            items: [
                t("update_v21_i1") || "画像圧縮エンジンの最適化。アップロード速度がさらに向上",
                t("update_v21_i2") || "UI全体の完全多言語化（日/英/西/中）。",
                t("update_v21_i3") || "法的ページの国際化",
                t("update_v21_i4") || "システム安定性の向上"
            ]
        },
        {
            date: "2026-02-22",
            title: t("update_v22_title") || "繋がりと表現の拡張（コミュニティ & 画像投稿）",
            items: [
                "コミュニティ機能（グループチャット）を実装",
                "画像投稿機能を追加",
                "ナビゲーションメニューの整理",
                "各ページのテーマ適用範囲の拡大"
            ]
        },
        {
            date: "2026-02-21",
            title: "自分好みの Honne. へ（テーマ・しおり・下書き）",
            items: [
                "背景テーマ選択機能の追加",
                "「しおり（保存）」機能を実装",
                "「下書き保存」機能の導入",
                "投稿演出の改善"
            ]
        },
        {
            date: "2026-02-18",
            title: "感情と時間の演出",
            items: [
                "水に流す機能（24時間消滅投稿）の実装",
                "感情カラー機能（Emotional UI）の導入",
                "AI哲学者による自動コメント開始"
            ]
        }
    ];

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <section className={styles.content}>
                <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>{t("updatesTitle")}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {updates.map((update, index) => (
                        <div key={index} style={{ borderLeft: '2px solid var(--accent-color)', paddingLeft: '1.5rem' }}>
                            <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {update.date}
                            </div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                {update.title}
                            </h2>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                {update.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
                <Link href="/" className={styles.backLink}>{t("backToHome")}</Link>
            </div>
        </main>
    );
}
