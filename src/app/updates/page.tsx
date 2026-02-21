"use client";

import Link from "next/link";
import styles from "../privacy/legal.module.css"; // Reuse legal styles for consistency
import UserNav from "@/components/UserNav";

export default function UpdatesPage() {
    const updates = [
        {
            date: "2026-02-22",
            title: "繋がりと表現の拡張（コミュニティ & 画像投稿）",
            items: [
                "コミュニティ機能（グループチャット）を実装。共通の想いで繋がる場所に",
                "画像投稿機能を追加。言葉と色彩で本音を表現可能に",
                "ナビゲーションメニューの整理とUXの改善",
                "各ページのテーマ適用範囲の拡大"
            ]
        },
        {
            date: "2026-02-21",
            title: "自分好みの Honne. へ（テーマ・しおり・下書き）",
            items: [
                "背景テーマ選択機能の追加（ダーク、ホワイト、生成色、夕暮れ）",
                "「しおり（保存）」機能を実装。心に響いた本音を手元に残せるように",
                "「下書き保存」機能の導入。言葉になる前の想いを一時保存可能に",
                "投稿時の演出を「送信中」から「心を落ち着かせています」へ洗練",
                "名前変更機能の不具合修正と安定性の向上"
            ]
        },
        {
            date: "2026-02-20",
            title: "機能拡張とUXの向上",
            items: [
                "名前変更機能の追加",
                "コメント設定に「人間のみ許可 (AIは不可)」オプションを追加",
                "新規カテゴリー「小説」「時事」「その他」の追加",
                "アップデートログの開設"
            ]
        },
        {
            date: "2026-02-18",
            title: "感情と時間の演出",
            items: [
                "水に流す機能（24時間消滅投稿）の実装",
                "感情カラー機能（Emotional UI）の導入",
                "AI哲学者による自動コメント機能の開始"
            ]
        },
        {
            date: "2026-02-15",
            title: "Honne. プレリリース",
            items: [
                "匿名の本音投稿機能",
                "カテゴリー別フィード",
                "メール認証システム"
            ]
        }
    ];

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>Honne.</Link>
                <UserNav />
            </header>

            <section className={styles.content}>
                <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>アップデートログ</h1>

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
                <Link href="/" className={styles.backLink}>ホームに戻る</Link>
            </div>
        </main>
    );
}
