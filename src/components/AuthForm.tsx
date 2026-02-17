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

export default function AuthForm() {
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
                // Reload user to get latest emailVerified status
                await userCredential.user.reload();
                router.push("/");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });

                // Send verification email
                await sendEmailVerification(userCredential.user);
                setSuccessMessage("登録完了！確認メールを送信しました。メールをご確認ください。");

                // Redirect after 3 seconds
                setTimeout(() => router.push("/"), 3000);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={`glass-panel ${styles.container}`}>
            <h2 className={styles.title}>{isLogin ? "ログイン" : "新規登録"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {!isLogin && (
                    <div className={styles.inputGroup}>
                        <label>ユーザー名</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="あなたの哲学名"
                            required
                        />
                    </div>
                )}
                <div className={styles.inputGroup}>
                    <label>メールアドレス</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@honne.com"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>パスワード</label>
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
                    {isLogin ? "ログイン" : "登録して本音を語る"}
                </button>
            </form>
            <p className={styles.switch}>
                {isLogin ? "まだアカウントがありませんか？" : "既にアカウントをお持ちですか？"}
                <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "新規登録はこちら" : "ログインはこちら"}
                </span>
            </p>
        </div>
    );
}
