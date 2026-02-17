"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, limit } from "firebase/firestore";

const ADMIN_PIN = "honne-admin-2026";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [activeTab, setActiveTab] = useState<"inquiries" | "posts">("inquiries");
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Function to handle login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert("PINコードが違います");
        }
    };

    // Fetch data from Firestore
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Inquiries
            const inquiriesRef = collection(db, "inquiries");
            const inquiriesQ = query(inquiriesRef, orderBy("createdAt", "desc"), limit(50));
            const inquiriesSnap = await getDocs(inquiriesQ);
            setInquiries(inquiriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Posts
            const postsRef = collection(db, "posts");
            const postsQ = query(postsRef, orderBy("createdAt", "desc"), limit(50));
            const postsSnap = await getDocs(postsQ);
            setPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Delete post function
    const handleDeletePost = async (postId: string) => {
        if (!confirm("本当にこの投稿を削除しますか？")) return;
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter(p => p.id !== postId));
            alert("投稿を削除しました");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginScreen}>
                <h1>Honne Admin</h1>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className={styles.pinInput}
                        placeholder="PIN Code"
                    />
                    <button type="submit" className={styles.loginBtn}>Unlock</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>Logout</button>
            </header>

            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === "inquiries" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("inquiries")}
                >
                    お問い合わせ ({inquiries.length})
                </div>
                <div
                    className={`${styles.tab} ${activeTab === "posts" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("posts")}
                >
                    投稿管理 ({posts.length})
                </div>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>Loading data...</div>
                ) : (
                    <>
                        {activeTab === "inquiries" && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Category</th>
                                            <th>Name / Email</th>
                                            <th>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inquiries.map((inq) => (
                                            <tr key={inq.id}>
                                                <td className={styles.dateCell}>
                                                    {inq.createdAt?.toDate?.().toLocaleString() || "Unknown"}
                                                </td>
                                                <td>{inq.category}</td>
                                                <td>
                                                    <div style={{ fontWeight: 'bold' }}>{inq.name || "No Name"}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{inq.email}</div>
                                                </td>
                                                <td className={styles.messageCell}>{inq.message}</td>
                                            </tr>
                                        ))}
                                        {inquiries.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className={styles.emptyState}>No inquiries found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "posts" && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Author</th>
                                            <th>Content</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post) => (
                                            <tr key={post.id}>
                                                <td className={styles.dateCell}>
                                                    {post.createdAt?.toDate?.().toLocaleString() || "Unknown"}
                                                </td>
                                                <td>
                                                    <div>{post.authorName}</div>
                                                    {post.isAnonymous && <span style={{ fontSize: '0.8rem', color: '#888' }}>(Anon)</span>}
                                                </td>
                                                <td className={styles.messageCell}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{post.title}</div>
                                                    {post.content?.slice(0, 100)}...
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeletePost(post.id)}
                                                    >
                                                        削除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {posts.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className={styles.emptyState}>No posts found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
