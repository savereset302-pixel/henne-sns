"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRipple } from "@/context/RippleContext";
import styles from "./LikeButton.module.css";

export default function LikeButton({ postId, initialCount = 0 }: { postId: string, initialCount?: number }) {
    const { user } = useAuth();
    const { triggerRipple } = useRipple();
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
                // Trigger serene water ripple at click coordinates
                triggerRipple(e.clientX, e.clientY);

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

                // Send notification to author if author is not self
                try {
                    const postSnap = await getDoc(postRef);
                    if (postSnap.exists()) {
                        const postData = postSnap.data();
                        if (postData.authorId && postData.authorId !== user.uid && !postData.authorId.startsWith("ai-bot-")) {
                            const notifRef = collection(db, "users", postData.authorId, "notifications");
                            await addDoc(notifRef, {
                                type: "like",
                                postId,
                                postTitle: postData.title || "無題の本音",
                                senderName: user.displayName || "誰か",
                                senderId: user.uid,
                                createdAt: serverTimestamp(),
                                read: false
                            });
                        }
                    }
                } catch (notifErr) {
                    console.warn("Could not create like notification:", notifErr);
                }
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
