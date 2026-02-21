"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import styles from "./CommentSection.module.css";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Comment {
    id: string;
    text: string;
    authorName: string;
    authorId: string;
    createdAt: any;
    isAi?: boolean; // To distinguish AI comments
}

export default function CommentSection({ postId, commentPolicy = 'all' }: { postId: string, commentPolicy?: string }) {
    const { t } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Comments
    useEffect(() => {
        if (!postId) return;

        const q = query(
            collection(db, "posts", postId, "comments"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comment[];
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "posts", postId, "comments"), {
                text: newComment,
                authorName: isAnonymous ? t("anonUser") : (user.displayName || t("ph_display_name")),
                authorId: user.uid,
                isAnonymous,
                createdAt: serverTimestamp(),
                isAi: false
            });

            // Increment comment count
            await updateDoc(doc(db, "posts", postId), {
                commentCount: increment(1)
            });

            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
            alert(t("errorOccurred"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.section}>
            <h3 className={styles.heading}>{t("commentsHeading")} ({comments.length})</h3>

            {commentPolicy === 'none' ? (
                <div className={styles.loginPrompt}>
                    {t("policyNone")}
                </div>
            ) : commentPolicy === 'ai_only' ? (
                <div className={styles.loginPrompt}>
                    {t("policyAiOnly")}
                </div>
            ) : user ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t("ph_comment")}
                        disabled={loading}
                    />

                    <label className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        {t("anonComment")}
                    </label>

                    <button type="submit" className={styles.submitBtn} disabled={loading || !newComment.trim()}>
                        {loading ? t("contactSubmitting") : t("submitComment")}
                    </button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    {t("loginToComment").includes("ログイン") ? (
                        <>コメントするには <Link href="/login" className={styles.loginLink}>ログイン</Link> してください。</>
                    ) : t("loginToComment").includes("Login") ? (
                        <>Please <Link href="/login" className={styles.loginLink}>Login</Link> to comment.</>
                    ) : t("loginToComment").includes("Iniciar sesión") ? (
                        <>Por favor, <Link href="/login" className={styles.loginLink}>Inicia sesión</Link> para comentar.</>
                    ) : t("loginToComment").includes("登录") ? (
                        <>请 <Link href="/login" className={styles.loginLink}>登录</Link> 以发表评论。</>
                    ) : (
                        <>{t("loginToComment")}</>
                    )}
                </div>
            )}

            <div className={styles.commentList}>
                {comments.map((comment) => (
                    <div key={comment.id} className={styles.comment}>
                        <div className={styles.commentHeader}>
                            <span className={comment.isAi ? styles.aiAuthor : styles.author}>
                                {comment.isAi && "🤖 "}
                                {comment.authorName}
                            </span>
                            <span className={styles.date}>
                                {comment.createdAt?.toDate?.().toLocaleString() || t("justNow")}
                            </span>
                        </div>
                        <div className={styles.body}>{comment.text}</div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p style={{ color: "#777", textAlign: "center" }}>{t("noComments")}</p>
                )}
            </div>
        </div>
    );
}

// Fixed ternary logic for Login link in CommentSection
