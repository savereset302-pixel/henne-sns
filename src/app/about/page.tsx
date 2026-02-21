"use client";

import Link from "next/link";
import styles from "./about.module.css";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1 className={styles.title}>
                        {t("aboutHero1")}<br />
                        {t("aboutHero2")}
                    </h1>
                </section>

                <section className={styles.message}>
                    <p>{t("aboutMsg1")}</p>
                    <p>{t("aboutMsg2")}</p>
                    <p>{t("aboutMsg3")}</p>
                    <p>{t("aboutMsg4")}</p>
                </section>

                <section className={styles.securityInfo}>
                    <h2>{t("aboutSecTitle")}</h2>
                    <div className={styles.securityGrid}>
                        <div className={styles.securityItem}>
                            <h3>{t("aboutSec1Title")}</h3>
                            <p>{t("aboutSec1Desc")}</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>{t("aboutSec2Title")}</h3>
                            <p>{t("aboutSec2Desc")}</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>{t("aboutSec3Title")}</h3>
                            <p>{t("aboutSec3Desc")}</p>
                        </div>
                    </div>
                </section>

                <div className={styles.action}>
                    <Link href="/post/new">
                        <button className="btn-primary">{t("newPost")}</button>
                    </Link>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/terms">{t("terms")}</Link>
                    <Link href="/privacy">{t("privacy")}</Link>
                    <Link href="/contact">{t("contact")}</Link>
                </div>
                <p>{t("copyright")}</p>
            </footer>
        </main>
    );
}
