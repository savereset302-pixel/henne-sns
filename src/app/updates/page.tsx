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
