"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function DialoguesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (!loading) {
            router.replace("/inbox");
        }
    }, [loading, router]);

    return (
        <main className="container fade-in" style={{ textAlign: "center", padding: "100px 0" }}>
            <p>{t("loadingPosts") || "読み込み中..."}</p>
            <p style={{ marginTop: "1.5rem" }}>
                <Link href="/inbox" className="btn-primary">
                    📬 受信ボックスへ移動
                </Link>
            </p>
        </main>
    );
}
