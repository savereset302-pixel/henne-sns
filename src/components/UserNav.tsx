"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import styles from "./UserNav.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function UserNav() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, "dialogues"),
            where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            let unread = 0;
            snap.docs.forEach((docSnap) => {
                const data = docSnap.data();
                if (!data.lastSenderId || data.lastSenderId === user.uid) return;

                const lastMsgTime = data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : (data.lastMessageAt?.seconds ? data.lastMessageAt.seconds * 1000 : 0);
                const readTime = data.readBy?.[user.uid]?.toMillis ? data.readBy[user.uid].toMillis() : (data.readBy?.[user.uid]?.seconds ? data.readBy[user.uid].seconds * 1000 : 0);

                if (lastMsgTime > readTime) {
                    unread++;
                }
            });
            setUnreadCount(unread);
        }, (err) => {
            console.warn("Unread dialogues listener warning:", err);
        });

        return () => unsubscribe();
    }, [user]);

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
                    <Link href="/dialogues" className={styles.inboxButton} title={t("dialogue_list")}>
                        <span>✉️ 受信箱</span>
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </Link>
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
