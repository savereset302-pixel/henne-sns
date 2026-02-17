"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import styles from "./LikeButton.module.css";

export default function LikeButton({ postId, initialCount = 0 }: { postId: string, initialCount?: number }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !postId) return;

        const checkLiked = async () => {
            const docRef = doc(db, "posts", postId, "likes", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setLiked(true);
            }
        };

        checkLiked();
    }, [user, postId]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a link
        e.stopPropagation();

        if (!user) {
            alert("「共感」するにはログインが必要です。");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const likeRef = doc(db, "posts", postId, "likes", user.uid);
            const postRef = doc(db, "posts", postId);

            if (liked) {
                // Unlike
                await deleteDoc(likeRef);
                await updateDoc(postRef, {
                    likeCount: increment(-1)
                });
                setLiked(false);
                setCount(prev => Math.max(0, prev - 1));
            } else {
                // Like
                await setDoc(likeRef, {
                    createdAt: serverTimestamp(),
                    userName: user.displayName || "Anonymous"
                });
                await updateDoc(postRef, {
                    likeCount: increment(1)
                });
                setLiked(true);
                setCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            className={`${styles.button} ${liked ? styles.active : ""}`}
            disabled={loading}
        >
            <span className={styles.icon}>{liked ? "❤️" : "🤍"}</span>
            <span className={styles.count}>{count}</span>
        </button>
    );
}
