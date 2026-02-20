"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Link from "next/link";
import styles from "../page.module.css";
import UserNav from "@/components/UserNav";

interface Draft {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: any;
}

export default function DraftsPage() {
    const { user, loading: authLoading } = useAuth();
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchDrafts = async () => {
            try {
                const draftsRef = collection(db, "drafts");
                const q = query(draftsRef, where("authorId", "==", user.uid), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);

                const draftsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Draft));
                setDrafts(draftsData);
            } catch (error) {
                console.error("Error fetching drafts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDrafts();
    }, [user]);

    if (authLoading) return <div className="container">読み込み中...</div>;
    if (!user) return <div className="container"><p>ログインが必要です。</p></div>;

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--logo-color)' }}>Honne.</Link>
                <UserNav />
            </header>

            <section style={{ marginTop: '3rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>下書き</h1>

                {loading ? (
                    <div className={styles.loading}>読み込み中...</div>
                ) : (
                    <div className={styles.grid}>
                        {drafts.length > 0 ? (
                            drafts.map((draft) => (
                                <div key={draft.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <span className={styles.category}>{draft.category}</span>
                                    <h3 className={styles.postTitle}>{draft.title || "(無題)"}</h3>
                                    <p className={styles.postSnippet}>{draft.content?.substring(0, 100)}...</p>
                                    <div className={styles.postFooter}>
                                        <span>保存日: {draft.createdAt?.toDate?.().toLocaleDateString()}</span>
                                        {/* TODO: Implement editing drafts. For now just link to new post or similar */}
                                        <button className={styles.readMore} style={{ opacity: 0.5, cursor: 'not-allowed' }}>編集 (開発中)</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>保存された下書きはありません。</p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
