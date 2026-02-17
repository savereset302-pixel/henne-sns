"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./post.module.css";
import UserNav from "@/components/UserNav";
import CommentSection from "@/components/CommentSection";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    createdAt: any;
    commentCount?: number;
}

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const docRef = doc(db, "posts", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as Post);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error getting document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) return <div className={styles.loading}>読み込み中...</div>;
    if (!post) return <div className={styles.notFound}>記事が見つかりませんでした。</div>;

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <div className={styles.container}>
                <div className={styles.postContent}>
                    <span className={styles.category}>{post.category}</span>
                    <h1 className={styles.title}>{post.title}</h1>
                    <div className={styles.text}>{post.content}</div>

                    <div className={styles.meta}>
                        <span>by {post.authorName}</span>
                        <span>{post.createdAt?.toDate?.().toLocaleDateString() || "Unknown Date"}</span>
                        <span>💬 {post.commentCount || 0}</span>
                    </div>

                    <CommentSection postId={post.id} />
                </div>

                <Link href="/" className={styles.backLink}>
                    ← ホームに戻る
                </Link>
            </div>
        </main>
    );
}
