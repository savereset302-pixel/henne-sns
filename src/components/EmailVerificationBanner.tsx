"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import styles from "./EmailVerificationBanner.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function EmailVerificationBanner() {
    const { t } = useLanguage();
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
            alert(t("sentVerification"));
        } catch (error) {
            alert(t("errorOccurred"));
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
                    <strong>{t("verifyTitle")}</strong>
                    <p>{t("verifyMsg")}</p>
                </div>
                <div className={styles.actions}>
                    <button
                        onClick={handleResend}
                        className={styles.resendBtn}
                        disabled={isSending}
                    >
                        {isSending ? t("contactSubmitting") : t("resend")}
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
