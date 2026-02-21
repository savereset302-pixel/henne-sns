"use client";

import Link from "next/link";
import styles from "./features.module.css";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturesPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1>{t("featuresTitle")}</h1>
                    <p>{t("featuresSub")}</p>
                </section>

                <div className={styles.featureGrid}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>👥</div>
                        <div className={styles.featureText}>
                            <h2>{t("feat_comm_title")}</h2>
                            <p>{t("feat_comm_desc")}</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`glass-panel ${styles.featureCard}`}>
                            <div className={styles.icon}>🖼️</div>
                            <div>
                                <h3>{t("feat_img_title")}</h3>
                                <p>{t("feat_img_desc")}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`glass-panel ${styles.featureCard}`}>
                            <div className={styles.icon}>🌐</div>
                            <div>
                                <h3>{t("feat_lang_title")}</h3>
                                <p>{t("feat_lang_desc")}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🎨</div>
                        <div className={styles.featureText}>
                            <h2>{t("feat_theme_title")}</h2>
                            <p>{t("feat_theme_desc")}</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🔖</div>
                        <div className={styles.featureText}>
                            <h2>{t("feat_bookmark_title")}</h2>
                            <p>{t("feat_bookmark_desc")}</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🧞</div>
                        <div className={styles.featureText}>
                            <h2>{t("feat_ai_title")}</h2>
                            <p>{t("feat_ai_desc")}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.backToTop}>
                    <Link href="/post/new" className="btn-primary" style={{ padding: '1rem 3rem' }}>
                        {t("newPost")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
