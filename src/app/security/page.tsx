"use client";

import Link from "next/link";
import styles from "../privacy/legal.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function SecurityPage() {
    const { t, language } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
            </header>

            <section className={styles.content}>
                <h1>{t("securityTitle")}</h1>
                <p>{t("securityBody")}</p>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    {language === "ja" ? "制定日：2026年2月20日" : "Effective Date: Feb 20, 2026"}
                </p>
            </section>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/about" className={styles.backLink}>← アバウトページへ</Link>
            </div>
        </main>
    );
}
