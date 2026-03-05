"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  createdAt: any;
  commentCount?: number;
  likeCount?: number;
  expiresAt?: any;
  sentiment?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    voters: string[];
  };
  authorId?: string;
  isAnonymous?: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, { title: string, content: string }>>({});
  const [filter, setFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emotionWeather, setEmotionWeather] = useState<{ icon: string; label: string; color: string }>({ icon: "☀️", label: "穏やか", color: "#ffd700" });

  const handleVote = async (postId: string, optionIndex: number) => {
    if (!user) {
      alert(t("loginRequired"));
      return;
    }

    try {
      const { doc, updateDoc, arrayUnion, getDoc } = await import("firebase/firestore");
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) return;
      const postData = postSnap.data() as Post;

      if (postData.poll?.voters?.includes(user.uid)) {
        alert(t("pollVoted") || "Voted already");
        return;
      }

      const newOptions = [...(postData.poll?.options || [])];
      if (newOptions[optionIndex]) {
        newOptions[optionIndex].votes += 1;
      }

      await updateDoc(postRef, {
        "poll.options": newOptions,
        "poll.totalVotes": (postData.poll?.totalVotes || 0) + 1,
        "poll.voters": arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

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

  const sentimentMap: any = {
    "all": t("sentiment_all"),
    "sadness": t("sentiment_sadness"),
    "anger": t("sentiment_anger"),
    "fatigue": t("sentiment_fatigue"),
    "joy": t("sentiment_joy")
  };

  const categories = ["all", "哲学", "独白", "社会", "人生", "技術", "小説", "時事", "その他"];
  const sentiments = ["all", "sadness", "anger", "fatigue", "joy"];

  useEffect(() => {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    if (filter !== "all" && sentimentFilter !== "all") {
      q = query(collection(db, "posts"), where("category", "==", filter), where("sentiment", "==", sentimentFilter), orderBy("createdAt", "desc"));
    } else if (filter !== "all") {
      q = query(collection(db, "posts"), where("category", "==", filter), orderBy("createdAt", "desc"));
    } else if (sentimentFilter !== "all") {
      q = query(collection(db, "posts"), where("sentiment", "==", sentimentFilter), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter, sentimentFilter]);

  useEffect(() => {
    if (posts.length > 0 && language !== "ja") {
      const translateAll = async () => {
        setIsTranslating(true);
        try {
          // Only translate if we haven't already translated these specific posts for this language
          const toTranslate = posts.filter(p => !translatedPosts[p.id]);
          if (toTranslate.length === 0) return;

          const res = await fetch("/api/translate", {
            method: "POST",
            body: JSON.stringify({
              texts: toTranslate.map(p => ({ id: p.id, title: p.title, content: p.content })),
              targetLang: language
            })
          });
          const data = await res.json();
          if (data.success && data.translatedItems) {
            const newTranslations = { ...translatedPosts };
            data.translatedItems.forEach((item: any) => {
              newTranslations[item.id] = { title: item.title, content: item.content };
            });
            setTranslatedPosts(newTranslations);
          }
        } catch (error) {
          console.error("Batch translation failed:", error);
        } finally {
          setIsTranslating(false);
        }
      };
      translateAll();
    } else {
      setTranslatedPosts({});
    }
  }, [posts, language]);

  useEffect(() => {
    if (posts.length === 0) return;

    const sentiments = posts.map(p => p.sentiment).filter(Boolean);
    if (sentiments.length === 0) return;

    const counts: Record<string, number> = {};
    sentiments.forEach(s => {
      counts[s!] = (counts[s!] || 0) + 1;
    });

    const dominant = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const weatherMap: Record<string, { icon: string; label: string; color: string }> = {
      joy: { icon: "☀️", label: t("weather_joy") || "快晴", color: "#ffb300" },
      sadness: { icon: "🌧️", label: t("weather_sadness") || "雨", color: "#3949ab" },
      anger: { icon: "⚡", label: t("weather_anger") || "雷雨", color: "#b71c1c" },
      fatigue: { icon: "☁️", label: t("weather_fatigue") || "曇り", color: "#757575" },
      default: { icon: "🌫️", label: t("weather_default") || "霧", color: "#a0a0a0" }
    };

    setEmotionWeather(weatherMap[dominant] || weatherMap.default);
  }, [posts, t]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const translated = translatedPosts[post.id];
    const title = (translated?.title || post.title).toLowerCase();
    const content = (translated?.content || post.content).toLowerCase();
    return title.includes(lowerQuery) || content.includes(lowerQuery);
  });

  return (
    <main className="container fade-in">
      <header className={styles.header}>
        <div className={styles.logo}>{t("siteName")}</div>
        <UserNav />
      </header>

      <section className={styles.hero}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.05)',
          padding: '8px 20px',
          borderRadius: '50px',
          marginBottom: '2rem',
          border: `1px solid ${emotionWeather.color}44`,
          boxShadow: `0 0 15px ${emotionWeather.color}22`
        }}>
          <span style={{ fontSize: '1.5rem' }}>{emotionWeather.icon}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t("weather_title")}: {emotionWeather.label}</span>
        </div>
        <h1 className={styles.heroTitle}>
          {t("heroTitle")}<br />
          <span>{t("heroSubTitle")}</span>
        </h1>
        <p className={styles.heroSub}>
          {t("heroDesc")}
        </p>
      </section>

      <EmailVerificationBanner />

      <section className={styles.feed}>
        <div className={styles.feedHeader}>
          <div className={styles.filtersContainer}>
            <div className={styles.filterSection}>
              <h3 className={styles.filterLabel}>{t("category")}:</h3>
              <div className={styles.filterBar}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.filterBtn} ${filter === cat ? styles.activeFilter : ""}`}
                    onClick={() => setFilter(cat)}
                  >
                    {categoryMap[cat] || cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3 className={styles.filterLabel}>{t("sentiment") || "Sentiment"}:</h3>
              <div className={styles.filterBar}>
                {sentiments.map(s => (
                  <button
                    key={s}
                    className={`${styles.filterBtn} ${sentimentFilter === s ? styles.activeFilter : ""} ${styles[s + 'Filter'] || ""}`}
                    onClick={() => setSentimentFilter(s)}
                  >
                    {sentimentMap[s] || s}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection} style={{ flex: 1, minWidth: '250px' }}>
              <div className={styles.searchBar} style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50px',
                padding: '0.5rem 1.5rem',
                border: '1px solid var(--border-color)',
                width: '100%'
              }}>
                <span style={{ marginRight: '10px', opacity: 0.5 }}>🔍</span>
                <input
                  type="text"
                  placeholder={t("ph_search") || "言葉を探す..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>{t("loadingPosts")}</div>
        ) : (
          <div className={styles.grid}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                const sentimentStyle = post.sentiment === "sadness" ? { background: "rgba(26, 35, 126, 0.25)", border: "1px solid rgba(26, 35, 126, 0.3)" } :
                  post.sentiment === "anger" ? { background: "rgba(74, 20, 20, 0.25)", border: "1px solid rgba(74, 20, 20, 0.3)" } :
                    post.sentiment === "fatigue" ? { background: "rgba(51, 51, 51, 0.3)", border: "1px solid rgba(100, 100, 100, 0.2)" } :
                      post.sentiment === "joy" ? { background: "rgba(100, 90, 40, 0.2)", border: "1px solid rgba(184, 164, 74, 0.2)" } :
                        {};

                const translated = translatedPosts[post.id];
                const displayTitle = translated ? translated.title : post.title;
                const displayContent = translated ? translated.content : post.content;

                return (
                  <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', transition: 'all 0.3s', ...sentimentStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className={styles.category}>{categoryMap[post.category] || post.category}</span>
                      {post.expiresAt && <span style={{ fontSize: '0.8rem', color: '#ffbd59' }}>⏳ 24h</span>}
                    </div>
                    {translated && <div className={styles.translatedBadge} style={{ fontSize: '0.7rem', marginBottom: '4px' }}>{t("translated")}</div>}
                    <h3 className={styles.postTitle}>{displayTitle}</h3>
                    <p className={styles.postSnippet}>{displayContent}</p>

                    {post.poll && (
                      <div className={styles.pollContainer} style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>📊 {post.poll.question}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {post.poll.options.map((opt, idx) => {
                            const hasVoted = post.poll?.voters?.includes(user?.uid || "");
                            const percentage = post.poll?.totalVotes ? Math.round((opt.votes / post.poll.totalVotes) * 100) : 0;

                            return (
                              <div key={idx} style={{ position: 'relative' }}>
                                <button
                                  onClick={() => handleVote(post.id, idx)}
                                  disabled={hasVoted}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.6rem 1rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: hasVoted ? 'default' : 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    justifyContent: 'space-between',
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
                                      background: 'rgba(79, 70, 229, 0.2)',
                                      zIndex: -1,
                                      transition: 'width 0.5s ease'
                                    }} />
                                  )}
                                  <span style={{ fontSize: '0.9rem' }}>{opt.text}</span>
                                  {hasVoted && (
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                      {percentage}% ({opt.votes})
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', opacity: 0.6, textAlign: 'right' }}>
                          {post.poll.totalVotes} {t("pollVote") || "Votes"}
                        </div>
                      </div>
                    )}

                    <div className={styles.postFooter}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                          💬 {post.commentCount || 0}
                        </span>
                        <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
                        <button
                          onClick={() => handleShare(post.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                          title={t("share")}
                        >
                          <span>🔗</span> {t("share")}
                        </button>
                      </div>
                      <Link href={`/posts/${post.id}`}>
                        <button className={styles.readMore}>{t("readMore")}</button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noPosts}>{t("noPosts")}</p>
            )}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/terms">{t("terms")}</Link>
          <Link href="/privacy">{t("privacy")}</Link>
          <Link href="/security">{t("security")}</Link>
          <Link href="/updates">{t("updates")}</Link>
          <Link href="/contact">{t("contact")}</Link>
        </div>
        <p>{t("copyright")}</p>
      </footer>
      {showShareToast && (
        <div className="glass-panel fade-in" style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '1rem 2rem',
          zIndex: 1000,
          background: 'rgba(79, 70, 229, 0.9)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: 'none'
        }}>
          {t("copySuccess")}
        </div>
      )}
    </main>
  );
}
