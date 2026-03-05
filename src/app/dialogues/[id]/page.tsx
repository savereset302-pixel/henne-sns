"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import styles from "./chat.module.css";

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
}

export default function DialogueChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [otherUser, setOtherUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id || !user) return;

        const fetchChatInfo = async () => {
            const chatRef = doc(db, "dialogues", id as string);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
                const data = chatSnap.data();
                const otherId = data.participants.find((p: string) => p !== user.uid);
                if (otherId) {
                    const userSnap = await getDoc(doc(db, "users", otherId));
                    if (userSnap.exists()) {
                        setOtherUser(userSnap.data());
                    }
                }
            } else {
                router.push("/dialogues");
            }
        };

        fetchChatInfo();

        const q = query(
            collection(db, "dialogues", id as string, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim() || !user || !id) return;

        const text = newMsg;
        setNewMsg("");

        try {
            await addDoc(collection(db, "dialogues", id as string, "messages"), {
                senderId: user.uid,
                text,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "dialogues", id as string), {
                lastMessage: text,
                lastMessageAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div className="container">{t("loadingPosts")}</div>;

    return (
        <main className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                <Link href="/dialogues" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>← {t("dialogue_list")}</Link>
                <div style={{ fontWeight: 700 }}>{otherUser?.displayName}</div>
                <UserNav />
            </header>

            <div className={styles.chatContainer}>
                <div className={styles.messageList} ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={msg.senderId === user?.uid ? styles.myMessage : styles.otherMessage}
                        >
                            <div className={styles.bubble}>
                                {msg.text}
                            </div>
                            <div className={styles.time}>
                                {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>

                <form className={styles.inputArea} onSubmit={sendMessage}>
                    <input
                        type="text"
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        placeholder={t("dialogue_placeholder")}
                        className={styles.input}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                        {t("dialogue_send")}
                    </button>
                </form>
            </div>
        </main>
    );
}
