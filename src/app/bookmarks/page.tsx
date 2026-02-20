"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import styles from "../page.module.css";
import UserNav from "@/components/UserNav";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    createdAt: any;
    likeCount?: number;
}

export default function BookmarksPage() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchBookmarks = async () => {
            try {
                const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
                const q = query(bookmarksRef, orderBy("savedAt", "desc"));
                const snapshot = await getDocs(q);

                const postsData: Post[] = [];
                for (const bookmarkDoc of snapshot.docs) {
                    const postId = bookmarkDoc.data().postId;
                    const postRef = doc(db, "posts", postId);
                    const postSnap = await getDoc(postRef);

                    if (postSnap.exists()) {
                        postsData.push({ id: postSnap.id, ...postSnap.data() } as Post);
                    }
                }
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching bookmarks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [user]);

    if (authLoading) return <div className="container">読み込み中...</div>;
    if (!user) return <div className="container"><p>ログインが必要です。</p></div>;

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--logo-color)' }}>Honne.</Link>
                <UserNav />
            </header>

            <section style={{ marginTop: '3rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>しおりを挟んだ本音</h1>

                {loading ? (
                    <div className={styles.loading}>読み込み中...</div>
                ) : (
                    <div className={styles.grid}>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <span className={styles.category}>{post.category}</span>
                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                    <p className={styles.postSnippet}>{post.content}</p>
                                    <div className={styles.postFooter}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span>by {post.authorName}</span>
                                            <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
                                            <BookmarkButton postId={post.id} />
                                        </div>
                                        <Link href={`/posts/${post.id}`}>
                                            <button className={styles.readMore}>詳しく読む</button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>まだしおりを挟んだ投稿はありません。</p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
