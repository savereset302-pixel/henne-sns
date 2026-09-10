"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import styles from "./journal.module.css";
import UserNav from "@/components/UserNav";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: any;
    sentiment?: string;
    isAnonymous?: boolean;
}

const EMOTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    joy: { icon: "☀️", label: "喜び・希望", color: "#eab308" },
    sadness: { icon: "🌧️", label: "悲しみ・憂鬱", color: "#6366f1" },
    anger: { icon: "⚡", label: "怒り・不満", color: "#ef4444" },
    fatigue: { icon: "☁️", label: "虚無・疲れ", color: "#94a3b8" },
    none: { icon: "🌫️", label: "中立・思索", color: "#a1a1aa" }
};

export default function JournalPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState<string>("all");

    // Fetch all posts written by the logged-in user
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchUserPosts = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                // Sort descending by date
                fetched.sort((a, b) => {
                    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                    return tB - tA;
                });

                setPosts(fetched);
            } catch (err) {
                console.error("Failed to fetch user journal posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user]);

    // Map posts by date string YYYY-MM-DD
    const postsByDate = useMemo(() => {
        const map: Record<string, Post[]> = {};
        posts.forEach(p => {
            if (!p.createdAt) return;
            const dateObj = p.createdAt.toDate ? p.createdAt.toDate() : (p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000) : new Date(p.createdAt));
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, "0");
            const d = String(dateObj.getDate()).padStart(2, "0");
            const key = `${y}-${m}-${d}`;
            if (!map[key]) map[key] = [];
            map[key].push(p);
        });
        return map;
    }, [posts]);

    // Calendar grid calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const calendarGrid = useMemo(() => {
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid: ({ day: number; dateStr: string; posts: Post[]; dominantEmotion?: string } | null)[] = [];

        // Leading empty cells
        for (let i = 0; i < firstDayOfWeek; i++) {
            grid.push(null);
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dayPosts = postsByDate[dateStr] || [];

            let dominantEmotion: string | undefined = undefined;
            if (dayPosts.length > 0) {
                const counts: Record<string, number> = {};
                dayPosts.forEach(p => {
                    const s = p.sentiment && EMOTION_CONFIG[p.sentiment] ? p.sentiment : "none";
                    counts[s] = (counts[s] || 0) + 1;
                });
                dominantEmotion = Object.entries(counts).reduce((a, b) => a[1] >= b[1] ? a : b)[0];
            }

            grid.push({
                day: d,
                dateStr,
                posts: dayPosts,
                dominantEmotion
            });
        }

        return grid;
    }, [year, month, postsByDate]);

    // Month navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    // Emotion balance statistics
    const stats = useMemo(() => {
        const total = posts.length;
        const counts: Record<string, number> = { joy: 0, sadness: 0, anger: 0, fatigue: 0, none: 0 };

        posts.forEach(p => {
            const s = p.sentiment && counts.hasOwnProperty(p.sentiment) ? p.sentiment : "none";
            counts[s]++;
        });

        const dominant = Object.entries(counts).filter(([k]) => k !== "none").sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            counts,
            dominantEmotion: dominant ? dominant[0] : null
        };
    }, [posts]);

    // Filtered timeline posts
    const filteredPosts = useMemo(() => {
        return posts.filter(p => {
            if (selectedDate) {
                const dateObj = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt?.seconds * 1000 || Date.now());
                const y = dateObj.getFullYear();
                const m = String(dateObj.getMonth() + 1).padStart(2, "0");
                const d = String(dateObj.getDate()).padStart(2, "0");
                if (`${y}-${m}-${d}` !== selectedDate) return false;
            }

            if (selectedEmotion !== "all") {
                if (selectedEmotion === "none") {
                    if (p.sentiment && p.sentiment !== "none") return false;
                } else if (p.sentiment !== selectedEmotion) {
                    return false;
                }
            }

            return true;
        });
    }, [posts, selectedDate, selectedEmotion]);

    if (authLoading) {
        return <div className="container" style={{ textAlign: "center", padding: "120px 0" }}>読み込み中...</div>;
    }

    if (!user) {
        return (
            <main className="container fade-in">
                <header className={styles.header}>
                    <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                    <UserNav />
                </header>
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <h2 style={{ marginBottom: "1rem" }}>🌱 本音の振り返り（マイジャーナル）</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                        過去に自分が残した本音や感情の移り変わりを静かに振り返るには、ログインが必要です。
                    </p>
                    <Link href="/login" className="btn-primary">
                        ログインして利用する
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <div className={styles.titleSection}>
                <h1 className={styles.title}>🌱 本音の振り返り</h1>
                <p className={styles.subtitle}>
                    過去の感情や思索の移り変わりを静かに見つめ、心を整えるあなたのためのプライベートな記録です。
                </p>
            </div>

            <div className={styles.journalGrid}>
                {/* Left Column: Calendar & Emotion Balance */}
                <div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                <span>📅</span>
                                <span>心のカレンダー</span>
                            </h2>
                            <div className={styles.monthNav}>
                                <button type="button" onClick={handlePrevMonth} className={styles.navBtn} aria-label="前月">‹</button>
                                <span className={styles.monthLabel}>{year}年 {month + 1}月</span>
                                <button type="button" onClick={handleNextMonth} className={styles.navBtn} aria-label="翌月">›</button>
                                <button type="button" onClick={handleToday} className={styles.navBtn} style={{ fontSize: "0.75rem" }}>今月</button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <table className={styles.calendarTable}>
                            <thead>
                                <tr>
                                    <th className={styles.weekdayHeader} style={{ color: "#ef4444" }}>日</th>
                                    <th className={styles.weekdayHeader}>月</th>
                                    <th className={styles.weekdayHeader}>火</th>
                                    <th className={styles.weekdayHeader}>水</th>
                                    <th className={styles.weekdayHeader}>木</th>
                                    <th className={styles.weekdayHeader}>金</th>
                                    <th className={styles.weekdayHeader} style={{ color: "#3b82f6" }}>土</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.ceil(calendarGrid.length / 7) }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {calendarGrid.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell, colIndex) => {
                                            if (!cell) {
                                                return <td key={colIndex} className={`${styles.calendarCell} ${styles.emptyCell}`} />;
                                            }

                                            const isSelected = selectedDate === cell.dateStr;
                                            const hasPosts = cell.posts.length > 0;
                                            const emo = cell.dominantEmotion ? EMOTION_CONFIG[cell.dominantEmotion] : null;

                                            return (
                                                <td
                                                    key={colIndex}
                                                    onClick={() => {
                                                        if (hasPosts) {
                                                            setSelectedDate(isSelected ? null : cell.dateStr);
                                                        }
                                                    }}
                                                    className={`${styles.calendarCell} ${styles.activeDayCell} ${hasPosts ? styles.hasPosts : ""} ${isSelected ? styles.selectedCell : ""}`}
                                                    title={hasPosts ? `${cell.dateStr}: ${cell.posts.length}件の本音` : undefined}
                                                >
                                                    <div>{cell.day}</div>
                                                    {hasPosts && emo && (
                                                        <div
                                                            className={styles.emotionDot}
                                                            style={{
                                                                backgroundColor: emo.color,
                                                                color: emo.color
                                                            }}
                                                        />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Emotion Balance */}
                        <div className={styles.statsSection}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                                <span>📊 感情のバランス</span>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>総思索数: {stats.total}件</span>
                            </h3>

                            {["joy", "fatigue", "sadness", "anger"].map(emoKey => {
                                const conf = EMOTION_CONFIG[emoKey];
                                const count = stats.counts[emoKey] || 0;
                                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                                return (
                                    <div key={emoKey} className={styles.statItem}>
                                        <div className={styles.statHeader}>
                                            <span>{conf.icon} {conf.label}</span>
                                            <span>{count}件 ({pct}%)</span>
                                        </div>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: conf.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className={styles.insightCard}>
                                💡 <strong>ジャーナルの気づき:</strong><br />
                                {stats.total === 0 ? (
                                    "まだ本音が記録されていません。日々の気持ちを綴ってみましょう。"
                                ) : stats.dominantEmotion === "joy" ? (
                                    "希望や喜びに満ちた言葉が多く残されています。前向きな思考が育まれています。"
                                ) : stats.dominantEmotion === "fatigue" ? (
                                    "疲れや虚無の感情が多めに表れています。無理をせず、温かいお茶を飲んでゆっくり休んでください。"
                                ) : stats.dominantEmotion === "sadness" ? (
                                    "胸の奥の寂しさや悲しみを素直に吐き出せています。言葉にすることで心は軽くなっていきます。"
                                ) : stats.dominantEmotion === "anger" ? (
                                    "不満や納得のいかない感情が記録されています。怒りをここに置いて、少し深呼吸してみましょう。"
                                ) : (
                                    "穏やかに日々の出来事と思考が記録されています。"
                                )}
                            </div>

                            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                <Link
                                    href={`/profile/${user.uid}`}
                                    className="btn-primary"
                                    style={{ fontSize: "0.85rem", padding: "8px 18px", width: "100%", textDecoration: "none" }}
                                >
                                    🤖 AI思索レポート（過去7日間の分析）を開く
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Reflection Timeline */}
                <div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                <span>📜</span>
                                <span>思索タイムライン</span>
                            </h2>
                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(null)}
                                    style={{
                                        background: "rgba(99, 102, 241, 0.15)",
                                        border: "1px solid var(--accent-color)",
                                        color: "var(--accent-color)",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "0.78rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    📅 {selectedDate} × 解除
                                </button>
                            )}
                        </div>

                        {/* Filter Pills */}
                        <div className={styles.timelineFilters}>
                            <button
                                type="button"
                                onClick={() => setSelectedEmotion("all")}
                                className={`${styles.filterPill} ${selectedEmotion === "all" ? styles.filterPillActive : ""}`}
                            >
                                すべて ({posts.length})
                            </button>
                            {Object.entries(EMOTION_CONFIG).map(([key, conf]) => {
                                const count = stats.counts[key] || 0;
                                if (count === 0 && selectedEmotion !== key) return null;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedEmotion(key)}
                                        className={`${styles.filterPill} ${selectedEmotion === key ? styles.filterPillActive : ""}`}
                                    >
                                        {conf.icon} {conf.label} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Post Cards */}
                        {loading ? (
                            <div className={styles.emptyNotice}>本音を読み込み中...</div>
                        ) : filteredPosts.length === 0 ? (
                            <div className={styles.emptyNotice}>
                                {selectedDate
                                    ? `「${selectedDate}」に記録された本音はありません。`
                                    : "条件に該当する本音がありません。"}
                            </div>
                        ) : (
                            <div className={styles.postList}>
                                {filteredPosts.map(p => {
                                    const dateObj = p.createdAt?.toDate
                                        ? p.createdAt.toDate()
                                        : (p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : new Date());
                                    const dateFormatted = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

                                    const emo = p.sentiment && EMOTION_CONFIG[p.sentiment] ? EMOTION_CONFIG[p.sentiment] : EMOTION_CONFIG.none;

                                    return (
                                        <Link key={p.id} href={`/posts/${p.id}`} className={styles.timelineCard}>
                                            <div className={styles.timelineMeta}>
                                                <div className={styles.metaGroup}>
                                                    <span className={styles.categoryTag}>{p.category}</span>
                                                    <span>•</span>
                                                    <span>{dateFormatted}</span>
                                                </div>
                                                <div className={styles.metaGroup}>
                                                    <span style={{ fontSize: "0.8rem", color: emo.color, fontWeight: 600 }}>
                                                        {emo.icon} {emo.label}
                                                    </span>
                                                    {p.isAnonymous && (
                                                        <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: "10px" }}>
                                                            🔒 匿名
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className={styles.postTitle}>{p.title || "無題の思考"}</h3>
                                            <p className={styles.postSnippet}>{p.content}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
