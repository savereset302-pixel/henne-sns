"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./profile.module.css";
import LikeButton from "@/components/LikeButton";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    createdAt: any;
    commentCount?: number;
    likeCount?: number;
    sentiment?: string;
    isAnonymous?: boolean;
}

interface UserProfile {
    displayName: string;
    bio?: string;
}

export default function ProfilePage() {
    const { id } = useParams();
    const { t } = useLanguage();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch user info
                const userRef = doc(db, "users", id as string);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setProfile(userSnap.data() as UserProfile);
                }

                // Fetch user's non-anonymous posts
                const postsRef = collection(db, "posts");
                const q = query(
                    postsRef,
                    where("authorId", "==", id),
                    where("isAnonymous", "==", false),
                    orderBy("createdAt", "desc")
                );
                const postsSnap = await getDocs(q);
                const fetchedPosts = postsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [id]);

    if (loading) return <div className="container">{t("loadingPosts")}</div>;
    if (!profile) return <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>{t("userNotFound") || "User Not Found"}</div>;

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', color: 'var(--accent-color)' }}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <div className={styles.profileHeader}>
                <div className={styles.avatarPlaceholder}>{profile.displayName.substring(0, 1)}</div>
                <h1 className={styles.displayName}>{profile.displayName}</h1>
                {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            </div>

            <section className={styles.feed}>
                <h2 className={styles.sectionTitle}>{t("userPosts") || "Recent Posts"}</h2>
                <div className={styles.grid}>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', transition: 'all 0.3s' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                                <p style={{ opacity: 0.8, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {post.content}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                                        <span>💬 {post.commentCount || 0}</span>
                                        <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
                                    </div>
                                    <Link href={`/posts/${post.id}`}>
                                        <button className="readMore" style={{
                                            background: 'transparent',
                                            border: '1px solid var(--accent-color)',
                                            color: 'var(--accent-color)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap'
                                        }}>{t("readMore")}</button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ opacity: 0.5 }}>{t("noPosts")}</p>
                    )}
                </div>
            </section>

            <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
                <Link href="/" style={{ opacity: 0.6, textDecoration: 'none' }}>{t("backToHome")}</Link>
            </div>
        </main>
    );
}
