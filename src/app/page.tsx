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
}

export default function Home() {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, { title: string, content: string }>>({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const categories = ["all", "哲学", "独白", "社会", "人生", "技術", "小説", "時事", "その他"];

  useEffect(() => {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    if (filter !== "all") {
      q = query(collection(db, "posts"), where("category", "==", filter), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

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

  return (
    <main className="container fade-in">
      <header className={styles.header}>
        <div className={styles.logo}>{t("siteName")}</div>
        <UserNav />
      </header>

      <section className={styles.hero}>
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
          <h2 className={styles.sectionTitle}>{t("recentPhilosophy")}</h2>
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

        {loading ? (
          <div className={styles.loading}>{t("loadingPosts")}</div>
        ) : (
          <div className={styles.grid}>
            {posts.length > 0 ? (
              posts.map((post) => {
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
                    <div className={styles.postFooter}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>by {post.authorName}</span>
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                          💬 {post.commentCount || 0}
                        </span>
                        <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
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
    </main>
  );
}
