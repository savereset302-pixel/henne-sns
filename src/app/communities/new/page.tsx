"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./newCommunity.module.css";

export default function NewCommunityPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("ログインが必要です");
            return;
        }

        setIsLoading(true);
        try {
            const docRef = await addDoc(collection(db, "communities"), {
                name,
                description,
                createdBy: auth.currentUser.displayName || "匿名",
                creatorId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                memberCount: 1
            });
            router.push(`/communities/${docRef.id}`);
        } catch (error) {
            console.error("Error creating community: ", error);
            alert("作成に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
            </header>

            <section className={styles.content}>
                <div className={`glass-panel ${styles.formWrapper}`}>
                    <h1>新しい部屋を作る</h1>
                    <p className={styles.subtitle}>共通の想いや趣味で繋がる空間をデザインしましょう。</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>コミュニティ名</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: 深夜の哲学、アニメ愛好会、など"
                                required
                                maxLength={30}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>説明文</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="どのような場所を目指していますか？"
                                required
                                rows={4}
                                maxLength={200}
                            />
                        </div>

                        <div className={styles.actions}>
                            <Link href="/communities" className={styles.cancel}>キャンセル</Link>
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? "作成中..." : "コミュニティを立ち上げる"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
