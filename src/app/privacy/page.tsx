"use client";

import Link from "next/link";
import styles from "./legal.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
            </header>

            <section className={styles.content}>
                <h1>{t("privacyTitle")}</h1>
                <p>{t("privacyBody")}</p>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    {language === "ja" ? "制定日：2026年2月20日" : "Effective Date: Feb 20, 2026"}
                </p>
            </section>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/" className={styles.backLink}>ホームに戻る</Link>
            </div>
        </main>
    );
}
