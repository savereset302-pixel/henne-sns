"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./post.module.css";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
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
    authorId?: string;
    isAnonymous?: boolean;
    poll?: {
        question: string;
        options: { text: string; votes: number }[];
        totalVotes: number;
        voters: string[];
    };
}

export default function PostPage() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);
    const { language, t } = useLanguage();
    const { user } = useAuth();

    const categoryMap: any = {
        "all": t("all"),
        "哲学": t("cat_philosophy"),
        "独白": t("cat_monologue"),
        "社会": t("cat_society"),
        "人生": t("cat_life"),
        "技術": t("cat_tech"),
        "小説": t("cat_novel"),
        "時事": t("cat_news"),
        "その他": t("cat_other")
    };

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

    const handleTranslate = async () => {
        if (!post) return;
        setIsTranslating(true);
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                body: JSON.stringify({
                    texts: [{ id: post.id, title: post.title, content: post.content }],
                    targetLang: language
                })
            });
            const data = await res.json();
            if (data.success && data.translatedItems && data.translatedItems[0]) {
                setTranslatedContent(data.translatedItems[0].content);
                setTranslatedTitle(data.translatedItems[0].title);
            }
        } catch (error) {
            console.error("Translation failed:", error);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleVote = async (optionIndex: number) => {
        if (!user) {
            alert(t("loginRequired") || "投票するにはログインが必要です。");
            return;
        }
        if (!post || !post.poll || !id) return;
        if (post.poll.voters?.includes(user.uid)) return;

        try {
            const updatedOptions = [...post.poll.options];
            updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;
            const updatedTotal = (post.poll.totalVotes || 0) + 1;
            const updatedVoters = [...(post.poll.voters || []), user.uid];

            const postRef = doc(db, "posts", id as string);
            await updateDoc(postRef, {
                "poll.options": updatedOptions,
                "poll.totalVotes": updatedTotal,
                "poll.voters": updatedVoters
            });

            setPost({
                ...post,
                poll: {
                    ...post.poll,
                    options: updatedOptions,
                    totalVotes: updatedTotal,
                    voters: updatedVoters
                }
            });
        } catch (err) {
            console.error("Error voting in detail page:", err);
        }
    };

    useEffect(() => {
        // Reset translations when navigating or changing language manually
        setTranslatedContent(null);
        setTranslatedTitle(null);
    }, [post, language]);

    if (loading) return <div className={styles.loading}>{t("loadingPosts")}</div>;
    if (!post) return <div className={styles.notFound}>{t("noPosts")}</div>;

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
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
                                <span className={styles.category}>{categoryMap[post.category] || post.category}</span>
                                {post.expiresAt && <span style={{ fontSize: '0.9rem', color: '#ffbd59' }}>{t("ephemeralAlert")}</span>}
                            </div>
                            {translatedTitle && <div className={styles.translatedBadge}>{t("translated")}</div>}
                            <h1 className={styles.title}>{translatedTitle || post.title}</h1>
                            {post.imageUrl && (
                                <div className={styles.postImage}>
                                    <img src={post.imageUrl} alt={post.title} />
                                </div>
                            )}

                            <div className={styles.contentWrapper}>
                                {translatedContent ? (
                                    <>
                                        <div className={styles.text}>{translatedContent}</div>
                                        <div className={styles.originalDivider}>
                                            <span>{t("original")}</span>
                                        </div>
                                        <div className={`${styles.text} ${styles.originalText}`}>{post.content}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.text}>{post.content}</div>
                                        {/* 日本語設定でも平仮名を含まない外国語投稿の場合、または他言語設定時に翻訳ボタンを表示 */}
                                        {(language !== "ja" || !/[\u3040-\u309F]/.test((post.title || "") + (post.content || ""))) && (
                                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={handleTranslate}
                                                    className="btn-primary"
                                                    disabled={isTranslating}
                                                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', opacity: isTranslating ? 0.7 : 1 }}
                                                >
                                                    {isTranslating ? t("loadingPosts") : (language === "ja" ? "日本語に翻訳して読む" : t("translatePost"))}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {post.poll && (
                                <div style={{
                                    margin: '1.5rem 0',
                                    padding: '1.2rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>📊 {post.poll.question}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {post.poll.options.map((opt, idx) => {
                                            const hasVoted = post.poll?.voters?.includes(user?.uid || "");
                                            const percentage = post.poll?.totalVotes ? Math.round((opt.votes / post.poll.totalVotes) * 100) : 0;
                                            return (
                                                <div key={idx} style={{ position: 'relative' }}>
                                                    <button
                                                        onClick={() => handleVote(idx)}
                                                        disabled={hasVoted}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            padding: '0.7rem 1.2rem',
                                                            background: hasVoted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '8px',
                                                            cursor: hasVoted ? 'default' : 'pointer',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            color: 'var(--text-primary)',
                                                            zIndex: 1
                                                        }}
                                                    >
                                                        {hasVoted && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                bottom: 0,
                                                                width: `${percentage}%`,
                                                                background: 'rgba(99, 102, 241, 0.25)',
                                                                zIndex: -1,
                                                                transition: 'width 0.5s ease'
                                                            }} />
                                                        )}
                                                        <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>{opt.text}</span>
                                                        {hasVoted && (
                                                            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                                                {percentage}% <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>({opt.votes})</span>
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right', fontWeight: 500 }}>
                                        {post.poll.totalVotes} {t("pollVote") || "Votes"}
                                    </div>
                                </div>
                            )}

                            <div className={styles.meta}>
                                {post.isAnonymous ? (
                                    <span>by {post.authorName}</span>
                                ) : (
                                    <Link href={`/profile/${post.authorId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        <span style={{ cursor: 'pointer', borderBottom: '1px dashed transparent', transition: 'border 0.2s' }}
                                            onMouseOver={(e) => (e.currentTarget.style.borderBottom = '1px dashed var(--accent-color)')}
                                            onMouseOut={(e) => (e.currentTarget.style.borderBottom = '1px dashed transparent')}>
                                            by {post.authorName}
                                        </span>
                                    </Link>
                                )}
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
                    {t("backToHome")}
                </Link>
            </div>
        </main>
    );
}
