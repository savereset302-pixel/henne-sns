"use client";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import styles from "./UserNav.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function UserNav() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();

    if (loading) return <div className={styles.skeleton}></div>;

    return (
        <nav className={styles.nav}>
            <div className={styles.links}>
                <Link href="/features" className={styles.link}>{t("features")}</Link>
                <Link href="/about" className={styles.link}>{t("about")}</Link>
                <Link href="/contact" className={styles.link}>{t("contact")}</Link>
                {user && (
                    <>
                        <Link href="/bookmarks" className={styles.link}>{t("bookmarks")}</Link>
                        <Link href="/drafts" className={styles.link}>{t("drafts")}</Link>
                        <Link href="/communities" className={styles.link}>{t("communities")}</Link>
                        <Link href="/settings" className={styles.link}>{t("settings")}</Link>
                    </>
                )}
            </div>
            {user ? (
                <>
                    <span className={styles.userName}>{user.displayName || t("anonUser")}{t("personSuffix")}</span>
                    <Link href="/post/new" className="btn-primary">{t("newPost")}</Link>
                    <button onClick={() => auth.signOut()} className={styles.signOut}>{t("logout")}</button>
                </>
            ) : (
                <Link href="/login" className="btn-primary">{t("login")}</Link>
            )}
        </nav>
    );
}
