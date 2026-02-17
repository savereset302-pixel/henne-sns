"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const ADMIN_EMAIL = "ykts.yukitosi.5698@gmail.com";

export default function AdminInitPage() {
    const { user, loading } = useAuth();
    const [status, setStatus] = useState("");

    const makeAdmin = async () => {
        if (!user) return;

        if (user.email !== ADMIN_EMAIL) {
            setStatus("このアカウントは管理者対象ではありません。");
            return;
        }

        try {
            await updateDoc(doc(db, "users", user.uid), {
                isAdmin: true
            });
            setStatus("成功！あなたは管理者になりました。リロードして確認してください。");
        } catch (error) {
            console.error(error);
            setStatus("エラーが発生しました: " + error);
        }
    };

    if (loading) return <div>読み込み中...</div>;

    if (!user) return <div>ログインしてください。</div>;

    return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h1>Admin Initialization</h1>
            <p>現在のログインユーザー: {user.email}</p>
            <p>管理者権限: {user.isAdmin ? "あり (TRUE)" : "なし (FALSE)"}</p>

            {!user.isAdmin && user.email === ADMIN_EMAIL && (
                <button
                    onClick={makeAdmin}
                    style={{
                        marginTop: '2rem',
                        padding: '1rem 2rem',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    私を管理者にする
                </button>
            )}

            {status && <p style={{ marginTop: '2rem', color: 'yellow' }}>{status}</p>}
        </div>
    );
}
