"use client";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import styles from "./UserNav.module.css";

export default function UserNav() {
    const { user, loading } = useAuth();

    if (loading) return <div className={styles.skeleton}></div>;

    return (
        <nav className={styles.nav}>
            {user ? (
                <>
                    <span className={styles.userName}>{user.displayName || "匿名ユーザー"}さん</span>
                    <Link href="/post/new" className="btn-primary">本音を綴る</Link>
                    <button onClick={() => auth.signOut()} className={styles.signOut}>ログアウト</button>
                </>
            ) : (
                <Link href="/login" className="btn-primary">はじめる</Link>
            )}
        </nav>
    );
}
