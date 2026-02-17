"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import styles from "./CommentSection.module.css";
import Link from "next/link";

interface Comment {
    id: string;
    text: string;
    authorName: string;
    authorId: string;
    createdAt: any;
    isAi?: boolean; // To distinguish AI comments
}

export default function CommentSection({ postId }: { postId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
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
                authorName: user.displayName || "匿名ユーザー",
                authorId: user.uid,
                createdAt: serverTimestamp(),
                isAi: false
            });
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("コメントの投稿に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.section}>
            <h3 className={styles.heading}>コメント ({comments.length})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="あなたの考えを共有してください..."
                        disabled={loading}
                    />
                    <button type="submit" className={styles.submitBtn} disabled={loading || !newComment.trim()}>
                        {loading ? "送信中..." : "コメントする"}
                    </button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    コメントするには <Link href="/login" className={styles.loginLink}>ログイン</Link> してください。
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
                                {comment.createdAt?.toDate?.().toLocaleString() || "たった今"}
                            </span>
                        </div>
                        <div className={styles.body}>{comment.text}</div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p style={{ color: "#777", textAlign: "center" }}>まだコメントはありません。</p>
                )}
            </div>
        </div>
    );
}
