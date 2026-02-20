"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import LikeButton from "@/components/LikeButton";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("すべて");
  const [loading, setLoading] = useState(true);

  const categories = ["すべて", "哲学", "独白", "社会", "人生", "技術", "小説", "時事", "その他"];

  useEffect(() => {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    if (filter !== "すべて") {
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

  return (
    <main className="container fade-in">
      <header className={styles.header}>
        <div className={styles.logo}>Honne.</div>
        <UserNav />
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          飾り言葉はいらない。<br />
          <span>あなたの本音を、ここに。</span>
        </h1>
        <p className={styles.heroSub}>
          世間の目を気にせず、あなたの内なる哲学を共有し、深め合うSNS。
        </p>
      </section>

      <EmailVerificationBanner />

      <section className={styles.feed}>
        <div className={styles.feedHeader}>
          <h2 className={styles.sectionTitle}>最近の哲学</h2>
          <div className={styles.filterBar}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${filter === cat ? styles.activeFilter : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>本音を読み込み中...</div>
        ) : (
          <div className={styles.grid}>
            {posts.length > 0 ? (
              posts.map((post) => {
                const sentimentStyle = post.sentiment === "sadness" ? { background: "rgba(26, 35, 126, 0.25)", border: "1px solid rgba(26, 35, 126, 0.3)" } :
                  post.sentiment === "anger" ? { background: "rgba(74, 20, 20, 0.25)", border: "1px solid rgba(74, 20, 20, 0.3)" } :
                    post.sentiment === "fatigue" ? { background: "rgba(51, 51, 51, 0.3)", border: "1px solid rgba(100, 100, 100, 0.2)" } :
                      post.sentiment === "joy" ? { background: "rgba(100, 90, 40, 0.2)", border: "1px solid rgba(184, 164, 74, 0.2)" } :
                        {};

                return (
                  <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', transition: 'all 0.3s', ...sentimentStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className={styles.category}>{post.category}</span>
                      {post.expiresAt && <span style={{ fontSize: '0.8rem', color: '#ffbd59' }}>⏳ 24h</span>}
                    </div>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postSnippet}>{post.content}</p>
                    <div className={styles.postFooter}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>by {post.authorName}</span>
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                          💬 {post.commentCount || 0}
                        </span>
                        <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
                      </div>
                      <Link href={`/posts/${post.id}`}>
                        <button className={styles.readMore}>詳しく読む</button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noPosts}>まだこのカテゴリーの本音はありません。</p>
            )}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/security">セキュリティ</Link>
          <Link href="/updates">アップデート情報</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        <p>&copy; 2026 Honne Sharing SNS.</p>
      </footer>
    </main>
  );
}
