"use client";

import Link from "next/link";
import styles from "./about.module.css";
import UserNav from "@/components/UserNav";

export default function AboutPage() {
    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1 className={styles.title}>
                        その言葉は、<br />
                        誰のためのものですか？
                    </h1>
                </section>

                <section className={styles.message}>
                    <p>
                        画面の向こうの誰かを気にして、<br />
                        本当に言いたいことを飲み込んでいませんか？
                    </p>
                    <p>
                        「よそ行きの自分」でいることは、<br />
                        社会でうまくやるための鎧かもしれません。<br />
                        でも、その鎧が重すぎて、<br />
                        あなた自身が息苦しくなってしまっては意味がない。
                    </p>
                    <p>
                        Honne. は、その鎧を脱ぎ捨てる場所です。
                    </p>
                    <p>
                        評価も、映えも、気遣いもいらない。<br />
                        あなたの心に浮かんだ「本音」を、<br />
                        ただそのまま、ここに置いていってください。
                    </p>
                </section>

                <section className={styles.securityInfo}>
                    <h2>安心して本音を語るために</h2>
                    <div className={styles.securityGrid}>
                        <div className={styles.securityItem}>
                            <h3>🔒 強固なセキュリティ</h3>
                            <p>GoogleのFirebase Authenticationを採用。パスワードは暗号化され、運営者も見ることはできません。</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>⏳ 水に流す機能</h3>
                            <p>「24時間で消滅」を選べば、痕跡を残さず本音を吐き出すことができます。</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>🤖 AIの寄り添い</h3>
                            <p>最新のAIがあなたの本音を分析し、哲学的な視点で寄り添います。</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/security" className={styles.securityLink}>技術的な安全への取り組み →</Link>
                    </div>
                </section>

                <div className={styles.action}>
                    <Link href="/">
                        <button className="btn-primary">本音を綴る</button>
                    </Link>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/terms">利用規約</Link>
                    <Link href="/privacy">プライバシーポリシー</Link>
                    <Link href="/contact">お問い合わせ</Link>
                </div>
                <p>&copy; 2026 Honne Sharing SNS.</p>
            </footer>
        </main>
    );
}
