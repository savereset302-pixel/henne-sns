"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit
} from "firebase/firestore";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import styles from "./chat.module.css";

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: any;
}

interface Community {
    id: string;
    name: string;
    description: string;
}

export default function CommunityChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const [community, setCommunity] = useState<Community | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;

        const fetchCommunity = async () => {
            const docRef = doc(db, "communities", id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCommunity({ id: docSnap.id, ...docSnap.data() } as Community);
            } else {
                router.push("/communities");
            }
        };

        fetchCommunity();

        const q = query(
            collection(db, "communities", id as string, "messages"),
            orderBy("createdAt", "asc"),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !auth.currentUser || !id) return;

        try {
            await addDoc(collection(db, "communities", id as string, "messages"), {
                text: newMessage,
                senderId: auth.currentUser.uid,
                senderName: auth.currentUser.displayName || "匿名",
                createdAt: serverTimestamp()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    if (loading) return <div className="container">読み込み中...</div>;
    if (!community) return null;

    return (
        <main className="container fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/communities" className={styles.back}>←</Link>
                    <div>
                        <h1 className={styles.commName}>{community.name}</h1>
                        <p className={styles.commDesc}>{community.description}</p>
                    </div>
                </div>
                <UserNav />
            </header>

            <div className={styles.chatArea} ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className={styles.empty}>まだメッセージがありません。会話を始めてみましょう。</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageWrapper} ${msg.senderId === auth.currentUser?.uid ? styles.ownMessage : ""}`}
                        >
                            <div className={styles.senderName}>{msg.senderName}</div>
                            <div className={`${styles.messageBubble} glass-panel`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                    className={styles.input}
                    required
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>送信</button>
            </form>
        </main>
    );
}
