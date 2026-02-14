"use client";

import { useState } from "react";
import styles from "./newPost.module.css";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("哲学");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("ログインが必要です");
            router.push("/login");
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, "posts"), {
                title,
                content,
                category,
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.displayName || "匿名",
                createdAt: serverTimestamp(),
            });
            router.push("/");
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("投稿に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
            </header>

            <section className={styles.content}>
                <div className={`glass-panel ${styles.formWrapper}`}>
                    <h1 className={styles.pageTitle}>本音を綴る</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>タイトル</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="その哲学に名を付けるなら？"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>カテゴリー</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="哲学">哲学</option>
                                <option value="独白">独白</option>
                                <option value="社会">社会</option>
                                <option value="人生">人生</option>
                                <option value="技術">技術</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>本文</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="あなたの内なる声を、思うがままに。"
                                required
                                rows={10}
                            />
                        </div>
                        <div className={styles.actions}>
                            <Link href="/" className={styles.cancel}>キャンセル</Link>
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? "送信中..." : "本音を放つ"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
