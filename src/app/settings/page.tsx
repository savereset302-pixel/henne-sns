"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import styles from "./settings.module.css";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            // 1. Update Firebase Auth profile
            await updateProfile(user, { displayName });

            // 2. Update Firestore user document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { displayName });

            setMessage({ type: "success", text: "名前を更新しました。" });
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: "error", text: "更新に失敗しました。もう一度お試しください。" });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) return <div className="container">読み込み中...</div>;
    if (!user) return (
        <div className="container">
            <p>設定を変更するにはログインが必要です。</p>
            <Link href="/login" className="btn-primary">ログイン</Link>
        </div>
    );

    return (
        <main className="container fade-in">
            <header style={{ padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>Honne.</Link>
            </header>

            <div className={styles.content}>
                <h1 className={styles.title}>設定</h1>

                <div className={styles.settingsCard}>
                    <form onSubmit={handleSave}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="displayName">表示名</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="名無し"
                                maxLength={20}
                            />
                        </div>

                        <button type="submit" className={`btn-primary ${styles.saveBtn}`} disabled={isSaving}>
                            {isSaving ? "保存中..." : "保存する"}
                        </button>

                        {message && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>ホームに戻る</Link>
                </div>
            </div>
        </main>
    );
}
