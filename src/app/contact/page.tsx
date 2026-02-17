"use client";

import { useState, useEffect } from "react";
import styles from "./contact.module.css";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import UserNav from "@/components/UserNav";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("バグ報告");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "inquiries"), {
                name,
                email,
                category,
                message,
                userId: auth.currentUser?.uid || "anonymous",
                createdAt: serverTimestamp(),
                status: "open"
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            alert("送信に失敗しました。時間をおいて再試行してください。");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container fade-in">
                <header className={styles.header}>
                    <Link href="/" className={styles.logo}>Honne.</Link>
                    <UserNav />
                </header>
                <div className={styles.successMessage}>
                    <h2>送信完了</h2>
                    <p>お問い合わせありがとうございます。<br />内容を確認し、必要に応じてご連絡いたします。</p>
                    <Link href="/">
                        <button className="btn-primary">ホームに戻る</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <section className={styles.content}>
                <h1 className={styles.title}>お問い合わせ</h1>
                <p className={styles.description}>
                    機能の不具合、ご意見、通報などはこちらからお送りください。
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>お名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="お名前（任意）"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>メールアドレス <span className={styles.required}>*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="返信用のメールアドレス"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>種別</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="バグ報告">バグ・不具合報告</option>
                            <option value="機能要望">機能の要望</option>
                            <option value="違反通報">投稿・ユーザーの通報</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>メッセージ内容 <span className={styles.required}>*</span></label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="詳細をご記入ください"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "送信中..." : "送信する"}
                    </button>
                </form>
            </section>
        </main>
    );
}
