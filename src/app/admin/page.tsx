"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css"; // Reuse main styles for consistency

interface Post {
    id: string;
    title: string;
    content: string;
    authorName: string;
    category: string;
    createdAt: any;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    useEffect(() => {
        if (user?.isAdmin) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
            const snapshot = await getDocs(q);
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[];
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("本当にこの投稿を削除しますか？この操作は取り消せません。")) return;

        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter(p => p.id !== postId));
            alert("削除しました。");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました。");
        }
    };

    if (loading) return <div className={styles.loading}>読み込み中...</div>;

    if (!user || !user.isAdmin) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Access Denied</h1>
                <p>このページにアクセスする権限がありません。</p>
                <Link href="/" style={{ color: '#2575fc', marginTop: '1rem', display: 'inline-block' }}>ホームに戻る</Link>
            </div>
        );
    }

    return (
        <main className="container active">
            <header className={styles.header}>
                <div className={styles.logo}>Honne Admin Disboard</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: '#aaa' }}>{user.email} (Admin)</span>
                    <Link href="/" className="btn-secondary">サイトに戻る</Link>
                </div>
            </header>

            <div style={{ marginBottom: '2rem' }}>
                <h2 className={styles.sectionTitle}>投稿管理 (最新50件)</h2>
                <button onClick={fetchPosts} className="btn-secondary" style={{ marginBottom: '1rem' }}>更新</button>
            </div>

            {loadingPosts ? (
                <p>読み込み中...</p>
            ) : (
                <div className={styles.grid}>
                    {posts.map((post) => (
                        <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255,100,100,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className={styles.category}>{post.category}</span>
                                <span style={{ fontSize: '0.8rem', color: '#777' }}>ID: {post.id}</span>
                            </div>
                            <h3 className={styles.postTitle}>{post.title}</h3>
                            <p className={styles.postSnippet} style={{ fontSize: '0.9rem' }}>{post.content.substring(0, 100)}...</p>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                    Author: {post.authorName}<br />
                                    Date: {post.createdAt?.toDate?.().toLocaleString()}
                                </div>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    style={{
                                        background: 'rgba(255, 50, 50, 0.2)',
                                        color: '#ff5555',
                                        border: '1px solid #ff5555',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
