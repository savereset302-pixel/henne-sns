"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserNav from "@/components/UserNav";
import { useAuth } from "@/hooks/useAuth";
import styles from "./communities.module.css";

interface Community {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: any;
    memberCount?: number;
}

export default function CommunitiesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"joined" | "explore">("joined");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [selectedRoomToJoin, setSelectedRoomToJoin] = useState<Community | null>(null);
    const [joinNickname, setJoinNickname] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "communities"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Community));
            setCommunities(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const qJoined = collection(db, "users", user.uid, "joinedRooms");
        const unsubscribeJoined = onSnapshot(qJoined, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.id);
            setJoinedRoomIds(ids);
        });

        return () => unsubscribeJoined();
    }, [user]);

    const joinedCommunities = communities.filter(c => joinedRoomIds.includes(c.id));
    const exploreCommunities = communities.filter(c => !joinedRoomIds.includes(c.id) && c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleRoomClick = (e: React.MouseEvent, comm: Community) => {
        e.preventDefault();
        if (joinedRoomIds.includes(comm.id)) {
            router.push(`/communities/${comm.id}`);
        } else {
            document.body.style.overflow = 'hidden';
            setSelectedRoomToJoin(comm);
            setJoinNickname(user?.displayName || "");
        }
    };

    const handleCloseModal = () => {
        document.body.style.overflow = 'auto';
        setSelectedRoomToJoin(null);
        setJoinNickname("");
    };

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedRoomToJoin || !joinNickname.trim()) return;

        setIsJoining(true);
        try {
            await setDoc(doc(db, "users", user.uid, "joinedRooms", selectedRoomToJoin.id), {
                nickname: joinNickname,
                joinedAt: serverTimestamp()
            });
            const roomId = selectedRoomToJoin.id;
            handleCloseModal();
            router.push(`/communities/${roomId}`);
        } catch (error) {
            console.error("Error joining community:", error);
            setIsJoining(false);
        }
    };

    if (!user && !loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <p>コミュニティ機能を利用するにはログインが必要です。</p>
                <Link href="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>ログイン</Link>
            </div>
        );
    }

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <div className={styles.hero}>
                <h1>コミュニティ</h1>
                <p>同じ想いや興味を持つ人々と、リアルタイムに繋がれる場所。</p>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Link href="/communities/new" className="btn-primary">
                        + 新しい部屋を作る
                    </Link>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={activeTab === "joined" ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab("joined")}
                >
                    参加済み
                </button>
                <button
                    className={activeTab === "explore" ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab("explore")}
                >
                    探す
                </button>
            </div>

            {activeTab === "explore" && (
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="部屋名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            )}

            <section className={styles.grid}>
                {loading ? (
                    <p className={styles.status}>読み込み中...</p>
                ) : activeTab === "joined" ? (
                    joinedCommunities.length === 0 ? (
                        <p className={styles.status}>まだ参加しているコミュニティがありません。「探す」から新しい部屋を見つけてみましょう。</p>
                    ) : (
                        joinedCommunities.map(comm => (
                            <a href={`/communities/${comm.id}`} onClick={(e) => handleRoomClick(e, comm)} key={comm.id} className={`${styles.card} glass-panel`}>
                                <h2 className={styles.cardTitle}>{comm.name}</h2>
                                <p className={styles.cardDesc}>{comm.description}</p>
                                <div className={styles.cardMeta}>
                                    <span>創設者: {comm.createdBy}</span>
                                    <span>参加済み</span>
                                </div>
                            </a>
                        ))
                    )
                ) : (
                    exploreCommunities.length === 0 ? (
                        <p className={styles.status}>条件に一致するコミュニティが見つかりません。</p>
                    ) : (
                        exploreCommunities.map(comm => (
                            <a href="#" onClick={(e) => handleRoomClick(e, comm)} key={comm.id} className={`${styles.card} glass-panel`}>
                                <h2 className={styles.cardTitle}>{comm.name}</h2>
                                <p className={styles.cardDesc}>{comm.description}</p>
                                <div className={styles.cardMeta}>
                                    <span>創設者: {comm.createdBy}</span>
                                    <span>未参加</span>
                                </div>
                            </a>
                        ))
                    )
                )}
            </section>

            {/* Join Modal */}
            {selectedRoomToJoin && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>{selectedRoomToJoin.name} に参加</h2>
                        <p>この部屋で使うニックネームを設定してください。<br />(他の部屋とは違う名前を設定できます)</p>

                        <form onSubmit={handleJoinSubmit}>
                            <div className={styles.inputGroup}>
                                <label>部屋用ニックネーム</label>
                                <input
                                    type="text"
                                    value={joinNickname}
                                    onChange={e => setJoinNickname(e.target.value)}
                                    className={styles.input}
                                    required
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={handleCloseModal} disabled={isJoining}>
                                    キャンセル
                                </button>
                                <button type="submit" className="btn-primary" disabled={isJoining} style={{ flexGrow: 1 }}>
                                    {isJoining ? "参加中..." : "参加する"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
