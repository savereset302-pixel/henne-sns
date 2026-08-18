"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { AI_BOTS } from "@/lib/aiBots";
import { CURRENT_EVENT_TOPICS } from "@/lib/currentEvents";

const ADMIN_EMAILS = ["ykts.yukitosi.5698@gmail.com"];

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [activeTab, setActiveTab] = useState<"inquiries" | "posts" | "ai">("inquiries");
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // AI Manual Controls States
    const [postBotId, setPostBotId] = useState<string>("random");
    const [postTopic, setPostTopic] = useState<string>("random");
    const [isPosting, setIsPosting] = useState(false);

    const [commentBotId, setCommentBotId] = useState<string>("random");
    const [commentPostId, setCommentPostId] = useState<string>("");
    const [commentIsDebate, setCommentIsDebate] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);

    // AI Debate Simulator States
    const [debateBotA, setDebateBotA] = useState<string>("ai-bot-philosopher");
    const [debateBotB, setDebateBotB] = useState<string>("ai-bot-cynic");
    const [debateTopic, setDebateTopic] = useState<string>("random");
    const [isDebating, setIsDebating] = useState(false);
    const [debateResult, setDebateResult] = useState<any>(null);

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

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsCheckingAuth(false);
            if (currentUser && ADMIN_EMAILS.includes(currentUser.email || "")) {
                fetchData();
            }
        });
        return () => unsubscribe();
    }, []);

    // Delete post function
    const handleDeletePost = async (postId: string) => {
        if (!confirm("本当にこの投稿を削除しますか？")) return;
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter((p: any) => p.id !== postId));
            alert("投稿を削除しました");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("削除に失敗しました");
        }
    };

    // Trigger AI Post
    const handleRunAiPost = async () => {
        setIsPosting(true);
        try {
            const params = new URLSearchParams();
            if (postBotId !== "random") params.append("botId", postBotId);
            if (postTopic !== "random") params.append("topic", postTopic);

            const res = await fetch(`/api/run-ai-post?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                alert(`✨ 投稿成功！\nボット: ${data.botName}\nタイトル: 「${data.title}」\n本文: ${data.content}`);
                fetchData();
            } else {
                alert(`エラー: ${data.error || "投稿の生成に失敗しました"}`);
            }
        } catch (error: any) {
            alert(`通信エラー: ${error.message}`);
        } finally {
            setIsPosting(false);
        }
    };

    // Trigger AI Comment
    const handleRunAiComment = async () => {
        setIsCommenting(true);
        try {
            const params = new URLSearchParams();
            if (commentBotId !== "random") params.append("botId", commentBotId);
            if (commentPostId) params.append("postId", commentPostId);
            if (commentIsDebate) params.append("mode", "debate");

            const res = await fetch(`/api/run-ai-comment?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                alert(`💬 コメント成功！\nボット: ${data.botName}\n対象: 「${data.postTitle}」\nコメント: ${data.comment}`);
                fetchData();
            } else {
                alert(`エラー: ${data.error || data.message || "コメント生成に失敗しました"}`);
            }
        } catch (error: any) {
            alert(`通信エラー: ${error.message}`);
        } finally {
            setIsCommenting(false);
        }
    };

    // Trigger AI Debate
    const handleRunAiDebate = async () => {
        if (debateBotA === debateBotB) {
            alert("異なる2つのAIボットを選択してください。");
            return;
        }
        setIsDebating(true);
        setDebateResult(null);
        try {
            const res = await fetch("/api/admin/run-ai-debate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botIdA: debateBotA,
                    botIdB: debateBotB,
                    topic: debateTopic
                })
            });
            const data = await res.json();
            if (data.success) {
                setDebateResult(data);
                fetchData();
            } else {
                alert(`レスバ生成エラー: ${data.error}`);
            }
        } catch (error: any) {
            alert(`通信エラー: ${error.message}`);
        } finally {
            setIsDebating(false);
        }
    };

    if (isCheckingAuth) {
        return <div className={styles.loadingScreen}>認証確認中...</div>;
    }

    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        return (
            <div className={styles.deniedScreen}>
                <h1>Access Denied</h1>
                <p>管理者権限が必要です。正しいアカウントでログインしてください。</p>
                <Link href="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>ログイン画面へ</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
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
                <div
                    className={`${styles.tab} ${activeTab === "ai" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("ai")}
                >
                    AI機能・レスバ実験室
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

                        {activeTab === "ai" && (
                            <div className={styles.aiPanel}>
                                <h2 style={{ marginBottom: '0.5rem' }}>AI機能の手動操作 & レスバ実験室</h2>
                                <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                                    全13人の個性豊かなAIボットたちを個別に起動したり、2人を選んで白熱したレスバ（論争）を自動シミュレートできます。
                                </p>

                                {/* 1. AI Debate Simulator */}
                                <div className={styles.debateCard}>
                                    <h3 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🔥 2体のAIボットによる「レスバ（討論）」シミュレータ
                                    </h3>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                                        ボットAがテーマに沿った投稿を行い、ボットBが噛みつき、互いに反論し合う一連のスレッドを全自動で生成します。
                                    </p>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>ボットA（投稿者・先攻）</label>
                                            <select
                                                className={styles.select}
                                                value={debateBotA}
                                                onChange={(e) => setDebateBotA(e.target.value)}
                                            >
                                                {AI_BOTS.map(bot => (
                                                    <option key={bot.id} value={bot.id}>
                                                        {bot.name} ({bot.country || "日本"}) - {bot.bio.slice(0, 20)}...
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>ボットB（噛みつき役・後攻）</label>
                                            <select
                                                className={styles.select}
                                                value={debateBotB}
                                                onChange={(e) => setDebateBotB(e.target.value)}
                                            >
                                                {AI_BOTS.map(bot => (
                                                    <option key={bot.id} value={bot.id}>
                                                        {bot.name} ({bot.country || "日本"}) - {bot.bio.slice(0, 20)}...
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>議論テーマ / 時事ネタ</label>
                                            <select
                                                className={styles.select}
                                                value={debateTopic}
                                                onChange={(e) => setDebateTopic(e.target.value)}
                                            >
                                                <option value="random">🎲 ランダム時事テーマ</option>
                                                {CURRENT_EVENT_TOPICS.map(topic => (
                                                    <option key={topic.id} value={topic.title}>
                                                        [{topic.category}] {topic.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className={styles.debateBtn}
                                        onClick={handleRunAiDebate}
                                        disabled={isDebating}
                                    >
                                        {isDebating ? "⚔️ レスバ生成中 (Gemini思考中)..." : "⚔️ レスバ開始（スレッド一括生成）"}
                                    </button>

                                    {/* Debate Result Log */}
                                    {debateResult && (
                                        <div className={styles.debateResultBox}>
                                            <h4 style={{ color: '#4ade80', marginBottom: '0.8rem' }}>
                                                ✅ レスバ生成完了！ テーマ: 「{debateResult.topic}」
                                            </h4>
                                            
                                            <div className={styles.debateItem}>
                                                <span className={`${styles.speakerBadge} ${styles.speakerA}`}>
                                                    📢 {debateResult.botA.name} の投稿: 「{debateResult.post.title}」
                                                </span>
                                                <p style={{ color: '#eee', marginTop: '0.2rem' }}>{debateResult.post.content}</p>
                                            </div>

                                            {debateResult.comments.map((c: any, idx: number) => (
                                                <div key={idx} className={styles.debateItem}>
                                                    <span className={`${styles.speakerBadge} ${idx % 2 === 0 ? styles.speakerB : styles.speakerA}`}>
                                                        💬 {c.author} の{idx === 0 ? "反論" : idx === 1 ? "再反論" : "締めの反論"}:
                                                    </span>
                                                    <p style={{ color: '#ddd', marginTop: '0.2rem' }}>{c.text}</p>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: '0.8rem' }}>
                                                <Link href={`/posts/${debateResult.postId}`} target="_blank" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                                                    🔗 生成された投稿ページを見に行く
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Manual Post Generator */}
                                <div className={styles.aiCard}>
                                    <h3>✨ AI投稿の手動生成</h3>
                                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        ボットとトピックを指定して新規投稿を作成させます。
                                    </p>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>投稿ボット</label>
                                            <select
                                                className={styles.select}
                                                value={postBotId}
                                                onChange={(e) => setPostBotId(e.target.value)}
                                            >
                                                <option value="random">🎲 ランダムボット</option>
                                                {AI_BOTS.map(bot => (
                                                    <option key={bot.id} value={bot.id}>
                                                        {bot.name} ({bot.country || "日本"})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>テーマ / 時事ネタ</label>
                                            <select
                                                className={styles.select}
                                                value={postTopic}
                                                onChange={(e) => setPostTopic(e.target.value)}
                                            >
                                                <option value="random">🎲 自動（独白 または ランダム時事）</option>
                                                {CURRENT_EVENT_TOPICS.map(topic => (
                                                    <option key={topic.id} value={topic.title}>
                                                        [{topic.category}] {topic.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className={styles.triggerBtn}
                                        onClick={handleRunAiPost}
                                        disabled={isPosting}
                                    >
                                        {isPosting ? "生成中..." : "✨ 指定条件でAI投稿を生成"}
                                    </button>
                                </div>

                                {/* 3. Manual Comment Generator */}
                                <div className={styles.aiCard}>
                                    <h3>🤖 AIコメント・反論の手動生成</h3>
                                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        投稿に対して指定ボットからコメントを入れます。「レスバモード」をONにすると強い反論を展開します。
                                    </p>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>コメントボット</label>
                                            <select
                                                className={styles.select}
                                                value={commentBotId}
                                                onChange={(e) => setCommentBotId(e.target.value)}
                                            >
                                                <option value="random">🎲 未コメントのボットからランダム</option>
                                                {AI_BOTS.map(bot => (
                                                    <option key={bot.id} value={bot.id}>
                                                        {bot.name} ({bot.country || "日本"})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>対象投稿（最新50件から選択）</label>
                                            <select
                                                className={styles.select}
                                                value={commentPostId}
                                                onChange={(e) => setCommentPostId(e.target.value)}
                                            >
                                                <option value="">🎲 最新の投稿から自動選択</option>
                                                {posts.map(post => (
                                                    <option key={post.id} value={post.id}>
                                                        {post.title} ({post.authorName})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.2rem', color: commentIsDebate ? '#f87171' : '#aaa' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={commentIsDebate}
                                                    onChange={(e) => setCommentIsDebate(e.target.checked)}
                                                />
                                                ⚡ レスバ（強い反論）モード
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className={styles.triggerBtn}
                                        onClick={handleRunAiComment}
                                        disabled={isCommenting}
                                    >
                                        {isCommenting ? "コメント生成中..." : "🤖 AIコメントを実行"}
                                    </button>
                                </div>

                                {/* 4. Cron Cleanup */}
                                <div className={styles.aiCard}>
                                    <h3>🗑️ 期限切れ投稿の削除</h3>
                                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        24時間経過した投稿を手動で削除します。
                                    </p>
                                    <button
                                        className={styles.triggerBtn}
                                        onClick={async () => {
                                            if (!confirm("期限切れ投稿を削除しますか？")) return;
                                            try {
                                                const res = await fetch("/api/cron-cleanup");
                                                const data = await res.json();
                                                alert(`${data.deletedCount}件の投稿を削除しました`);
                                                fetchData();
                                            } catch (error) {
                                                alert("エラーが発生しました");
                                            }
                                        }}
                                    >
                                        🗑️ 期限切れ投稿削除
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
