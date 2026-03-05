"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
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
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [report, setReport] = useState<any>(null);

    const startDialogue = async () => {
        if (!user || user.uid === id) return;

        try {
            const dialoguesRef = collection(db, "dialogues");
            const q = query(
                dialoguesRef,
                where("participants", "array-contains", user.uid)
            );
            const snap = await getDocs(q);
            const existing = snap.docs.find(doc => doc.data().participants.includes(id));

            if (existing) {
                router.push(`/dialogues/${existing.id}`);
            } else {
                const { addDoc, serverTimestamp } = await import("firebase/firestore");
                const newDialogue = await addDoc(dialoguesRef, {
                    participants: [user.uid, id],
                    lastMessageAt: serverTimestamp(),
                    status: "active",
                    createdAt: serverTimestamp()
                });
                router.push(`/dialogues/${newDialogue.id}`);
            }
        } catch (error) {
            console.error("Error starting dialogue:", error);
        }
    };

    const generateReport = async () => {
        if (!user) return;
        setIsGeneratingReport(true);
        try {
            const res = await fetch("/api/ai-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid, language })
            });
            const data = await res.json();
            if (data.success) {
                setReport(data.report);
            } else {
                alert(data.error || "Report generation failed");
            }
        } catch (error) {
            console.error("Report generation error:", error);
            alert("An error occurred while generating the report");
        } finally {
            setIsGeneratingReport(false);
        }
    };

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
                {user && user.uid !== id && (
                    <button
                        onClick={startDialogue}
                        className="btn-primary"
                        style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                    >
                        💬 {t("dialogue_start")}
                    </button>
                )}
                {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            </div>

            {user?.uid === id && (
                <section className={styles.aiReportSection} style={{ marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>✨ {t("ai_report_title")}</h2>
                                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{t("ai_report_desc")}</p>
                            </div>
                            <button
                                onClick={generateReport}
                                disabled={isGeneratingReport || posts.length === 0}
                                className="btn-primary"
                                style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
                            >
                                {isGeneratingReport ? t("ai_report_loading") : t("ai_report_generate")}
                            </button>
                        </div>

                        {report && (
                            <div className="fade-in" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                                <div style={{ marginBottom: '1.5rem', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--accent-color)' }}>
                                    "{report.summary}"
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t("ai_report_themes")}</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {report.themes?.map((theme: string, i: number) => (
                                            <span key={i} style={{ background: 'var(--accent-color)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                                {theme}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t("ai_report_insight")}</h4>
                                    <p style={{ lineHeight: '1.8', opacity: 0.9 }}>{report.insight}</p>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>💡 {report.advice}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

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
