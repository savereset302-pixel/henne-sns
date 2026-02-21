"use client";

import Link from "next/link";
import styles from "./legal.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
            </header>

            <section className={styles.content}>
                <h1>{t("privacyTitle")}</h1>
                <p>Honne.（以下「当サービス」）は、ユーザーの個人情報の保護を重要視しています。</p>

                <h2>1. 収集する情報</h2>
                <p>当サービスでは、以下の情報を収集します：</p>
                <ul>
                    <li><strong>アカウント情報:</strong> メールアドレス、表示名</li>
                    <li><strong>コンテンツ:</strong> 投稿内容、コメント、感情データ、カテゴリー</li>
                    <li><strong>利用ログ:</strong> ログイン日時、いいね、閲覧履歴など</li>
                </ul>

                <h2>2. 情報の利用目的</h2>
                <p>収集した情報は以下の目的で使用します：</p>
                <ul>
                    <li>サービスの提供および運営</li>
                    <li>AIによる自動コメント生成および感情分析機能の提供</li>
                    <li>スパム行為や利用規約違反の防止</li>
                    <li>ユーザーからのお問い合わせへの対応</li>
                </ul>

                <h2>3. 情報の管理（セキュリティ）</h2>
                <p>当サービスはGoogleのFirebaseを使用しており、パスワードは高度に暗号化され、運営者も閲覧できない仕組みになっています。また、一時的な投稿（24時間消滅機能）を提供することで、ユーザーのプライバシーに配慮しています。</p>

                <h2>4. 第三者への提供</h2>
                <p>法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、AI機能の提供のために、投稿内容のみをGoogle Gemini APIに送信します（個人を特定する情報は送信しません）。</p>

                <h2>5. お問い合わせ</h2>
                <p>プライバシーに関するご質問は、<Link href="/contact" style={{ color: 'var(--accent-color)' }}>お問い合わせフォーム</Link>よりご連絡ください。</p>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    制定日：2026年2月20日
                </p>
            </section>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/" className={styles.backLink}>ホームに戻る</Link>
            </div>
        </main>
    );
}
