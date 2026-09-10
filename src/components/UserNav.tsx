"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import styles from "./UserNav.module.css";
import { useLanguage } from "@/context/LanguageContext";
import NotificationBell from "./NotificationBell";

export default function UserNav() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Close user dropdown menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    if (loading) return <div className={styles.skeleton}></div>;

    return (
        <nav className={styles.nav}>
            {/* Desktop Quick Links */}
            <div className={styles.desktopLinks}>
                <Link href="/updates" className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-color)', fontWeight: 600 }}>
                    <span>📜</span>
                    <span>{t("updatesTitle") || "アップデート"}</span>
                </Link>
                <Link href="/features" className={styles.link}>{t("features")}</Link>
                <Link href="/communities" className={styles.link}>{t("communities")}</Link>
                <Link href="/about" className={styles.link}>{t("about")}</Link>
            </div>

            {user ? (
                <div className={styles.actionsGroup}>
                    {/* 1. Notification Bell */}
                    <NotificationBell />

                    {/* 2. Direct Messages (Inbox) */}
                    <Link href="/inbox" className={styles.inboxButton} title={t("dialogue_list")}>
                        <span>✉️</span>
                        <span className={styles.inboxText}>受信箱</span>
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </Link>

                    {/* 3. New Post Button */}
                    <Link href="/post/new" className={`btn-primary ${styles.newPostButton}`}>
                        <span>✏️</span>
                        <span className={styles.newPostText}>{t("newPost")}</span>
                    </Link>

                    {/* 4. User Profile & Settings Dropdown */}
                    <div className={styles.userMenuContainer} ref={menuRef}>
                        <button
                            type="button"
                            className={styles.userMenuTrigger}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-label="ユーザーメニュー"
                        >
                            <span>👤</span>
                            <span>{user.displayName || t("anonUser")}</span>
                            <span className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ""}`}>▾</span>
                        </button>

                        {isMenuOpen && (
                            <div className={styles.userDropdown}>
                                <Link
                                    href={`/profile/${user.uid}`}
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>👤</span>
                                    <span>マイプロフィール</span>
                                </Link>
                                <Link
                                    href="/bookmarks"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>🔖</span>
                                    <span>{t("bookmarks")}</span>
                                </Link>
                                <Link
                                    href="/journal"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>🌱</span>
                                    <span>{t("journal") || "本音の振り返り"}</span>
                                </Link>
                                <Link
                                    href="/drafts"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>📝</span>
                                    <span>{t("drafts")}</span>
                                </Link>
                                <Link
                                    href="/communities"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>👥</span>
                                    <span>{t("communities")}</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>⚙️</span>
                                    <span>{t("settings")}</span>
                                </Link>

                                <div className={styles.menuDivider} />

                                <Link
                                    href="/features"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>✨</span>
                                    <span>{t("features")}</span>
                                </Link>
                                <Link
                                    href="/about"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>📖</span>
                                    <span>{t("about")}</span>
                                </Link>
                                <Link
                                    href="/contact"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>📮</span>
                                    <span>{t("contact")}</span>
                                </Link>
                                <Link
                                    href="/updates"
                                    className={styles.menuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className={styles.menuIcon}>📜</span>
                                    <span>{t("updatesTitle") || "アップデート情報"}</span>
                                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)', borderRadius: '10px', marginLeft: 'auto', fontWeight: 600 }}>v3.8</span>
                                </Link>

                                <div className={styles.menuDivider} />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        auth.signOut();
                                    }}
                                    className={`${styles.menuItem} ${styles.signOutItem}`}
                                >
                                    <span className={styles.menuIcon}>🚪</span>
                                    <span>{t("logout")}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.actionsGroup}>
                    <Link href="/login" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        {t("login")}
                    </Link>
                </div>
            )}
        </nav>
    );
}
