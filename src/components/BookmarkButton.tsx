"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import styles from "./BookmarkButton.module.css";

export default function BookmarkButton({ postId }: { postId: string }) {
    const { user } = useAuth();
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !postId) return;

        const checkBookmarked = async () => {
            const docRef = doc(db, "users", user.uid, "bookmarks", postId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBookmarked(true);
            }
        };

        checkBookmarked();
    }, [user, postId]);

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("しおりを挟むにはログインが必要です。");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const bookmarkRef = doc(db, "users", user.uid, "bookmarks", postId);

            if (bookmarked) {
                await deleteDoc(bookmarkRef);
                setBookmarked(false);
            } else {
                await setDoc(bookmarkRef, {
                    postId,
                    savedAt: serverTimestamp()
                });
                setBookmarked(true);
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleBookmark}
            className={`${styles.button} ${bookmarked ? styles.active : ""}`}
            disabled={loading}
            title={bookmarked ? "しおりを抜く" : "しおりを挟む"}
        >
            <span className={styles.icon}>{bookmarked ? "🔖" : "📖"}</span>
            <span className={styles.label}>{bookmarked ? "しおり済み" : "しおり"}</span>
        </button>
    );
}
