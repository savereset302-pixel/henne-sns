"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import UserNav from "@/components/UserNav";
import styles from "./inbox.module.css";

interface Dialogue {
    id: string;
    participants: string[];
    lastMessageAt: any;
    lastMessage?: string;
    lastSenderId?: string;
    status: string;
    createdAt: any;
    seenBy?: Record<string, any>;
}

interface DialogueItem extends Dialogue {
    otherName: string;
    otherInitial: string;
    isUnread: boolean;
    timeLabel: string;
}

function formatTime(ts: any): string {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export default function InboxPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [dialogues, setDialogues] = useState<DialogueItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const dialoguesRef = collection(db, "dialogues");
        const q = query(
            dialoguesRef,
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsub = onSnapshot(q, async (snap) => {
            const items: DialogueItem[] = await Promise.all(
                snap.docs.map(async (docSnap) => {
                    const data = docSnap.data() as Dialogue;
                    const otherId = data.participants.find((p) => p !== user.uid) || "";

                    // 相手の名前を取得
                    let otherName = "不明なユーザー";
                    let otherInitial = "?";
                    try {
                        const userRef = doc(db, "users", otherId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const udata = userSnap.data();
                            otherName = udata.displayName || "匿名";
                        } else if (otherId === "ai-bot-gemini") {
                            otherName = "Gemini AI";
                        } else if (otherId === "ai-bot-honne") {
                            otherName = "Honne.";
                        } else {
                            // AIボット名を探す
                            const { AI_BOTS } = await import("@/lib/aiBots");
                            const bot = AI_BOTS.find((b) => b.id === otherId);
                            if (bot) otherName = bot.name;
                        }
                        otherInitial = otherName.charAt(0).toUpperCase();
                    } catch {
                        // ignore
                    }

                    // 未読判定: readBy / seenBy[user.uid] < lastMessageAt かつ 最後の送信者が自分でない
                    let isUnread = false;
                    if (
                        data.lastSenderId &&
                        data.lastSenderId !== user.uid &&
                        data.lastMessageAt
                    ) {
                        const seenAt = (data as any).readBy?.[user.uid] || data.seenBy?.[user.uid];
                        if (!seenAt) {
                            isUnread = true;
                        } else {
                            const seenDate = seenAt.toDate ? seenAt.toDate() : new Date(seenAt);
                            const lastDate = data.lastMessageAt.toDate
                                ? data.lastMessageAt.toDate()
                                : new Date(data.lastMessageAt);
                            isUnread = lastDate > seenDate;
                        }
                    }

                    return {
                        ...data,
                        id: docSnap.id,
                        otherName,
                        otherInitial,
                        isUnread,
                        timeLabel: formatTime(data.lastMessageAt),
                    };
                })
            );
            setDialogues(items);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    if (authLoading || loading) {
        return (
            <main className="container">
                <div className={styles.loadingText}>{t("loadingPosts")}</div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="container" style={{ textAlign: "center", padding: "100px 0" }}>
                <p>{t("loginRequired")}</p>
                <Link href="/login" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                    {t("login")}
                </Link>
            </main>
        );
    }

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    {t("siteName")}
                </Link>
                <UserNav />
            </header>

            <section className={styles.section}>
                <h1 className={styles.title}>📬 受信ボックス</h1>
                <p className={styles.subtitle}>心の対話 — ダイレクトメッセージ</p>

                {dialogues.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💬</div>
                        <p>まだダイレクトメッセージはありません</p>
                        <p className={styles.emptyHint}>
                            プロフィールページから「心の対話を始める」を押して会話を始めましょう
                        </p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {dialogues.map((item) => (
                            <Link
                                key={item.id}
                                href={`/dialogues/${item.id}`}
                                className={`${styles.item} ${item.isUnread ? styles.unread : ""}`}
                            >
                                <div className={styles.avatar}>{item.otherInitial}</div>
                                <div className={styles.info}>
                                    <div className={styles.nameRow}>
                                        <span className={styles.name}>{item.otherName}</span>
                                        <span className={styles.time}>{item.timeLabel}</span>
                                    </div>
                                    <div className={styles.preview}>
                                        {item.lastMessage || "メッセージを開始しました"}
                                    </div>
                                </div>
                                {item.isUnread && <div className={styles.unreadDot} />}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <div style={{ textAlign: "center", marginTop: "3rem", paddingBottom: "3rem" }}>
                <Link href="/" style={{ opacity: 0.6, textDecoration: "none" }}>
                    {t("backToHome")}
                </Link>
            </div>
        </main>
    );
}
