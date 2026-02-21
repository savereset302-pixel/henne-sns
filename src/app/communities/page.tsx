"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import styles from "./communities.module.css";

interface Community {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: any;
    memberCount?: number;
}

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "communities"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Community));
            setCommunities(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <div className={styles.hero}>
                <h1>コミュニティ</h1>
                <p>同じ想いや興味を持つ人々と、リアルタイムに繋がれる場所。</p>
                <Link href="/communities/new" className="btn-primary" style={{ marginTop: '2rem' }}>
                    + 新しい部屋を作る
                </Link>
            </div>

            <section className={styles.grid}>
                {loading ? (
                    <p className={styles.status}>読み込み中...</p>
                ) : communities.length === 0 ? (
                    <p className={styles.status}>まだコミュニティがありません。最初の部屋を立ち上げてみませんか？</p>
                ) : (
                    communities.map(comm => (
                        <Link href={`/communities/${comm.id}`} key={comm.id} className={`${styles.card} glass-panel`}>
                            <h2 className={styles.cardTitle}>{comm.name}</h2>
                            <p className={styles.cardDesc}>{comm.description}</p>
                            <div className={styles.cardMeta}>
                                <span>創設者: {comm.createdBy}</span>
                                <span>{comm.createdAt?.toDate?.().toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))
                )}
            </section>
        </main>
    );
}
