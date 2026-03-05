"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import styles from "./dialogues.module.css";

interface Dialogue {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageAt?: any;
    otherUser?: {
        displayName: string;
    };
}

export default function DialoguesPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [dialogues, setDialogues] = useState<Dialogue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "dialogues"),
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snap) => {
            try {
                const fetchedDialogues = await Promise.all(snap.docs.map(async (d) => {
                    const data = d.data();
                    const otherId = data.participants.find((p: string) => p !== user.uid);

                    // Fetch other user's info
                    let otherName = "Unknown";
                    if (otherId) {
                        const userSnap = await getDoc(doc(db, "users", otherId));
                        if (userSnap.exists()) {
                            otherName = userSnap.data().displayName;
                        }
                    }

                    return {
                        id: d.id,
                        ...data,
                        otherUser: { displayName: otherName }
                    } as Dialogue;
                }));
                setDialogues(fetchedDialogues);
                setLoading(false);
            } catch (err) {
                console.error("Error processing dialogues snapshot:", err);
                setLoading(false);
            }
        }, (error) => {
            console.error("Firestore onSnapshot error (Dialogues):", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (!user) return <div className="container">{t("loginRequired")}</div>;

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t("dialogue_list")}</h1>

            {loading ? (
                <p>{t("loadingPosts")}</p>
            ) : dialogues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                    <p>{t("dialogue_no_chats")}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {dialogues.map(chat => (
                        <Link key={chat.id} href={`/dialogues/${chat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{chat.otherUser?.displayName}</h3>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                        {chat.lastMessageAt?.toDate()?.toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {chat.lastMessage || "..."}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
