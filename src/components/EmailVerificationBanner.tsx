"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import styles from "./EmailVerificationBanner.module.css";

export default function EmailVerificationBanner() {
    const [user, setUser] = useState(auth.currentUser);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleResend = async () => {
        if (!user) return;
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            alert("確認メールを再送信しました！");
        } catch (error) {
            alert("エラーが発生しました。しばらくしてから再度お試しください。");
        } finally {
            setIsSending(false);
        }
    };

    // Don't show if user is not logged in, email is verified, or banner is dismissed
    if (!user || user.emailVerified || isDismissed) {
        return null;
    }

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <span className={styles.icon}>📧</span>
                <div className={styles.text}>
                    <strong>メールアドレスの確認をお願いします</strong>
                    <p>登録したメールアドレス宛に確認メールを送信しました。メール内のリンクをクリックして確認を完了してください。</p>
                </div>
                <div className={styles.actions}>
                    <button
                        onClick={handleResend}
                        className={styles.resendBtn}
                        disabled={isSending}
                    >
                        {isSending ? "送信中..." : "再送信"}
                    </button>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className={styles.closeBtn}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
