"use client";

import Link from "next/link";
import styles from "./about.module.css";
import UserNav from "@/components/UserNav";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>{t("siteName")}</Link>
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1 className={styles.title}>
                        {t("aboutHero1")}<br />
                        {t("aboutHero2")}
                    </h1>
                </section>

                <section className={styles.message}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {t("aboutMsg1")}
                    </p>
                    <p>
                        {t("aboutMsg2")}
                    </p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                        {t("aboutMsg3")}
                    </p>
                    <p>
                        {t("aboutMsg4")}
                    </p>
                </section>

                <section className={styles.securityInfo}>
                    <h2>🌿 Honne.が大切にしている3つの安心</h2>
                    <div className={styles.securityGrid}>
                        <div className={styles.securityItem}>
                            <h3>🔒 評価や数字のない世界</h3>
                            <p>フォロワー数や拡散数で競う必要はありません。完全匿名での投稿や、24時間で自動消滅する「水に流す」設定も選べます。</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>🤖 否定せず寄り添うAI</h3>
                            <p>孤独な夜でも、あなたの感情を受け止め、新たな思索のヒントをくれる多彩なAIキャラクターたちがいつでも待っています。</p>
                        </div>
                        <div className={styles.securityItem}>
                            <h3>🌤️ 穏やかな心の共鳴</h3>
                            <p>タイムラインには「心の天気」が広がり、同じように迷い、悩み、生きる人々の体温を静かに感じることができます。</p>
                        </div>
                    </div>
                </section>

                <section style={{ margin: '4rem 0', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.4rem' }}>🕊️ はじめての方へ 〜 過ごし方</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.98rem', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ background: 'var(--accent-color)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</span>
                            <div><strong>心に浮かんだ声をそのまま置く:</strong> 誰にも言えなかった悩みや独り言、日々の疑問をそのまま書き留めてください。</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ background: 'var(--accent-color)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</span>
                            <div><strong>心地よい空間に整える:</strong> お好みの壁紙やフォント、雨や波の環境音（BGM）を流して、自分だけの思索時間に。</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ background: 'var(--accent-color)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</span>
                            <div><strong>そっと共感し、安心する:</strong> 他の誰かの本音を読んで「自分だけじゃない」と感じたら、共感ボタンを静かに押してみてください。</div>
                        </div>
                    </div>
                </section>

                <div className={styles.action}>
                    <Link href="/post/new">
                        <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '14px 32px' }}>{t("newPost")}</button>
                    </Link>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/terms">{t("terms")}</Link>
                    <Link href="/privacy">{t("privacy")}</Link>
                    <Link href="/contact">{t("contact")}</Link>
                </div>
                <p>{t("copyright")}</p>
            </footer>
        </main>
    );
}
