"use client";

import { useState } from "react";
import styles from "./AuthForm.module.css";
import { auth } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthForm() {
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await userCredential.user.reload();

                if (!userCredential.user.emailVerified) {
                    try {
                        await sendEmailVerification(userCredential.user);
                        setSuccessMessage(t("authSentVerification"));
                    } catch (emailError) {
                        console.error("Failed to send verification email:", emailError);
                    }
                }

                router.push("/");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });

                await sendEmailVerification(userCredential.user);
                setSuccessMessage(t("authSignupSuccess"));

                setTimeout(() => router.push("/"), 3000);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={`glass-panel ${styles.container}`}>
            <h2 className={styles.title}>{isLogin ? t("authLogin") : t("authSignup")}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {!isLogin && (
                    <div className={styles.inputGroup}>
                        <label>{t("authUsername")}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t("authUsernamePH")}
                            required
                        />
                    </div>
                )}
                <div className={styles.inputGroup}>
                    <label>{t("authEmail")}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@honne.com"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>{t("authPassword")}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {successMessage && <p className={styles.success}>{successMessage}</p>}
                <button type="submit" className="btn-primary">
                    {isLogin ? t("authSubmitLogin") : t("authSubmitSignup")}
                </button>
            </form>
            <p className={styles.switch}>
                {isLogin ? t("authNoAccount") : t("authHasAccount")}
                <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? t("authGoSignup") : t("authGoLogin")}
                </span>
            </p>
        </div>
    );
}
