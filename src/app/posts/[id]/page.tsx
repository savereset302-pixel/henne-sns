"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./post.module.css";
import UserNav from "@/components/UserNav";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import CommentSection from "@/components/CommentSection";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    createdAt: any;
    commentCount?: number;
    likeCount?: number;
    commentPolicy?: string;
    expiresAt?: any;
    sentiment?: string;
    imageUrl?: string | null;
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
                {(() => {
                    const sentimentStyle = post.sentiment === "sadness" ? { background: "rgba(26, 35, 126, 0.15)", border: "1px solid rgba(26, 35, 126, 0.2)" } :
                        post.sentiment === "anger" ? { background: "rgba(74, 20, 20, 0.15)", border: "1px solid rgba(74, 20, 20, 0.2)" } :
                            post.sentiment === "fatigue" ? { background: "rgba(51, 51, 51, 0.2)", border: "1px solid rgba(100, 100, 100, 0.1)" } :
                                post.sentiment === "joy" ? { background: "rgba(100, 90, 40, 0.1)", border: "1px solid rgba(184, 164, 74, 0.1)" } :
                                    {};

                    return (
                        <div className={styles.postContent} style={sentimentStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className={styles.category}>{post.category}</span>
                                {post.expiresAt && <span style={{ fontSize: '0.9rem', color: '#ffbd59' }}>⏳ この投稿は24時間で消滅します</span>}
                            </div>
                            <h1 className={styles.title}>{post.title}</h1>
                            {post.imageUrl && (
                                <div className={styles.postImage}>
                                    <img src={post.imageUrl} alt={post.title} />
                                </div>
                            )}
                            <div className={styles.text}>{post.content}</div>

                            <div className={styles.meta}>
                                <span>by {post.authorName}</span>
                                <span>{post.createdAt?.toDate?.().toLocaleDateString() || "Unknown Date"}</span>
                                <span>💬 {post.commentCount || 0}</span>
                                <div style={{ marginLeft: '1rem', display: 'flex', gap: '1rem' }}>
                                    <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
                                    <BookmarkButton postId={post.id} />
                                </div>
                            </div>

                            <CommentSection postId={post.id} commentPolicy={post.commentPolicy} />
                        </div>
                    );
                })()}

                <Link href="/" className={styles.backLink}>
                    ← ホームに戻る
                </Link>
            </div>
        </main>
    );
}
