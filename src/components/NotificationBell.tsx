"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import styles from "./NotificationBell.module.css";

export interface AppNotification {
    id: string;
    type: "like" | "comment" | "mention";
    postId: string;
    postTitle?: string;
    senderName: string;
    senderId?: string;
    senderIsAi?: boolean;
    text?: string;
    createdAt: any;
    read: boolean;
}

function formatTime(ts: any): string {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const notifRef = collection(db, "users", user.uid, "notifications");
        const q = query(notifRef, orderBy("createdAt", "desc"), limit(25));

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as AppNotification));
            setNotifications(list);
        }, (err) => {
            console.warn("Notifications onSnapshot error:", err);
        });

        return () => unsub();
    }, [user]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid, "notifications", id), {
                read: true
            });
        } catch {}
    };

    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) return;
        try {
            const batch = writeBatch(db);
            notifications.filter(n => !n.read).forEach(n => {
                const ref = doc(db, "users", user.uid, "notifications", n.id);
                batch.update(ref, { read: true });
            });
            await batch.commit();
        } catch (e) {
            console.error("Failed to mark all notifications read:", e);
        }
    };

    if (!user) return null;

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                type="button"
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="通知"
                title="通知"
            >
                <span>🔔</span>
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>お知らせ</span>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className={styles.markReadBtn}
                                onClick={markAllAsRead}
                            >
                                すべて既読
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                新しい通知はありません
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const icon = n.type === "like"
                                    ? "❤️"
                                    : n.type === "mention"
                                        ? "🤖"
                                        : "💬";

                                return (
                                    <Link
                                        key={n.id}
                                        href={`/posts/${n.postId}`}
                                        className={`${styles.item} ${!n.read ? styles.unreadItem : ""}`}
                                        onClick={() => {
                                            if (!n.read) markAsRead(n.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className={styles.iconCol}>{icon}</div>
                                        <div className={styles.contentCol}>
                                            <div className={styles.itemText}>
                                                <strong>{n.senderName}</strong>
                                                {n.type === "like"
                                                    ? " さんがあなたの本音に共感しました"
                                                    : n.type === "mention"
                                                        ? " があなたへの返信を行いました"
                                                        : " さんがコメントしました"}
                                            </div>
                                            {n.text && (
                                                <div className={styles.itemSnippet}>
                                                    {n.text}
                                                </div>
                                            )}
                                            <div className={styles.itemTime}>
                                                {formatTime(n.createdAt)}
                                            </div>
                                        </div>
                                        {!n.read && <div className={styles.unreadDot} />}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
