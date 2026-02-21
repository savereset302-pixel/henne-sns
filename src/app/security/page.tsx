"use client";

import Link from "next/link";
import styles from "../privacy/legal.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function SecurityPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
            </header>

            <section className={styles.content}>
                <h1>{t("securityTitle")}</h1>
                <p>Honne.は、個人開発のプロジェクトでありながら、エンタープライズレベルの基盤技術を採用することで、ユーザーの安全を確保しています。</p>

                <h2>1. アカウントの保護</h2>
                <p>
                    認証基盤には<strong>Google CloudのFirebase Authentication</strong>を使用しています。
                    お客様のパスワードは、業界標準のアルゴリズム（bcrypt等）を複数回適用した高度なハッシュ化状態でGoogleの管理サーバーに保存されます。
                    このため、当サービスの運営者であっても、お客様のパスワードを知ることは技術的に不可能です。
                </p>

                <h2>2. 通信の暗号化</h2>
                <p>
                    当サービスとのすべての通信は<strong>TLS（SSL）</strong>によって暗号化されています。
                    第三者が通信内容を傍受することは困難であり、公共のWi-Fi等からでも安心してご利用いただけます。
                </p>

                <h2>3. 投稿内容のサニタイズ</h2>
                <p>
                    Next.jsおよびReactのクロスサイトスクリプティング（XSS）防止機能を活用しています。
                    ユーザーが投稿したテキストは、表示前に自動的にサニタイズ（安全な処理）が行われるため、悪意のあるスクリプトが実行されることはありません。
                </p>

                <h2>4. 匿名性とデータの透明性</h2>
                <p>
                    匿名投稿機能では、投稿から投稿者のプロフィールへのリンクが切り離されます。
                    また、24時間で消滅する投稿は物理的にデータベースから削除されるため、サーバーに永続的に残ることはありません。
                </p>

                <h2>5. 第三者APIの利用</h2>
                <p>
                    AIコメントおよび感情分析にはGoogle Gemini APIを使用しています。
                    API送信時には個人の特定に繋がる情報は原則として送信せず、Googleのプライバシー規約に基づいた安全な処理が行われます。
                </p>
            </section>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/about" className={styles.backLink}>← アバウトページへ</Link>
            </div>
        </main>
    );
}
