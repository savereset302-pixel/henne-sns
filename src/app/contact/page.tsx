"use client";

import { useState, useEffect } from "react";
import styles from "./contact.module.css";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("バグ報告");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "inquiries"), {
                name,
                email,
                category,
                message,
                userId: auth.currentUser?.uid || "anonymous",
                createdAt: serverTimestamp(),
                status: "open"
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            alert("送信に失敗しました。時間をおいて再試行してください。");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container fade-in">
                <header className={styles.header}>
                    <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                    <UserNav />
                </header>
                <div className={styles.successMessage}>
                    <h2>{t("contactSuccessTitle")}</h2>
                    <p>{t("contactSuccessMsg")}</p>
                    <Link href="/">
                        <button className="btn-primary">{t("backToHome")}</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <section className={styles.content}>
                <h1 className={styles.title}>{t("contactTitle")}</h1>
                <p className={styles.description}>
                    {t("contactDesc")}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>{t("contactName")}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("contactName")}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t("contactEmail")} <span className={styles.required}>*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("contactEmail")}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t("contactCategory")}</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="バグ報告">{t("con_cat_bug")}</option>
                            <option value="機能要望">{t("con_cat_req")}</option>
                            <option value="違反通報">{t("con_cat_report")}</option>
                            <option value="その他">{t("con_cat_other")}</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t("contactMsg")} <span className={styles.required}>*</span></label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="..."
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t("contactSubmitting") : t("contactSubmit")}
                    </button>
                </form>
            </section>
        </main>
    );
}
