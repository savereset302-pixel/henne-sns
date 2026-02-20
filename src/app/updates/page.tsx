"use client";

import Link from "next/link";
import styles from "../privacy/legal.module.css"; // Reuse legal styles for consistency
import UserNav from "@/components/UserNav";

export default function UpdatesPage() {
    const updates = [
        {
            date: "2026-02-21",
            title: "機能拡張とUXの向上",
            items: [
                "名前変更機能の追加（設定画面から変更可能）",
                "コメント設定に「人間のみ許可 (AIは不可)」オプションを追加",
                "投稿時の瞑想ディレイ（3秒間の静寂）の導入",
                "新規カテゴリー「小説」「時事」「その他」の追加"
            ]
        },
        {
            date: "2026-02-20",
            title: "信頼性とアクセシビリティの強化",
            items: [
                "機能紹介ページ（/features）の公開",
                "利用規約、プライバシーポリシー、セキュリティページの設置",
                "ナビゲーションメニューの整理",
                "管理画面のセキュリティ強化（Firebase Authによる厳格な制限）"
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
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff' }}>
                                {update.title}
                            </h2>
                            <ul style={{ color: '#aaa', lineHeight: '1.8' }}>
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
