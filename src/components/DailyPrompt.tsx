"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./DailyPrompt.module.css";
import { getDailyPrompt } from "@/data/dailyPrompts";
import { useLanguage } from "@/context/LanguageContext";

export default function DailyPrompt() {
    const { language, t } = useLanguage();
    const [collapsed, setCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        try {
            const saved = localStorage.getItem("shizunari_prompt_collapsed");
            if (saved === "true") {
                setCollapsed(true);
            }
        } catch {}
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            localStorage.setItem("shizunari_prompt_collapsed", String(next));
        } catch {}
    };

    const prompt = getDailyPrompt(language);

    if (!isMounted) return null;

    if (collapsed) {
        return (
            <div className={styles.card} style={{ padding: "0.85rem 1.4rem" }}>
                <div className={styles.collapsedContent}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <span className={styles.badge}>
                            <span>🪷</span>
                            <span>{t("dailyPromptBadge") || "今日の問い"}</span>
                        </span>
                        <span className={styles.collapsedText}>{prompt.question}</span>
                    </div>
                    <button
                        onClick={toggleCollapse}
                        className={styles.toggleBtn}
                        aria-label="展開する"
                    >
                        <span>展開 ▾</span>
                    </button>
                </div>
            </div>
        );
    }

    const postUrl = `/post/new?prompt=${encodeURIComponent(prompt.question)}&title=${encodeURIComponent(prompt.question)}`;

    return (
        <aside className={styles.card} aria-label="AI哲学者からの今日の問い">
            <div className={styles.header}>
                <div className={styles.meta}>
                    <span className={styles.badge}>
                        <span>🪷</span>
                        <span>{t("dailyPromptBadge") || "今日の問い"}</span>
                    </span>
                    <span className={styles.author}>by {prompt.author}</span>
                </div>
                <button
                    onClick={toggleCollapse}
                    className={styles.toggleBtn}
                    aria-label="折りたたむ"
                >
                    <span>折りたたむ ▴</span>
                </button>
            </div>

            <h3 className={styles.question}>
                「{prompt.question}」
            </h3>

            <div className={styles.footer}>
                <span className={styles.hint}>
                    <span>🕊️</span>
                    <span>{t("dailyPromptHint") || "誰かの評価を気にせず、心に浮かんだ素直な言葉を置いてみませんか？"}</span>
                </span>
                <Link href={postUrl} className={styles.actionBtn}>
                    <span>✍️</span>
                    <span>{t("dailyPromptAction") || "この問いに答えて本音を置く"}</span>
                </Link>
            </div>
        </aside>
    );
}
