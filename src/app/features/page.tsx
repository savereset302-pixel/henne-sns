import Link from "next/link";
import styles from "./features.module.css";
import UserNav from "@/components/UserNav";

export default function FeaturesPage() {
    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1>Honne. の機能</h1>
                    <p>あなたの本音を解き放ち、深めるための道具たち。</p>
                </section>

                <div className={styles.featureGrid}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>⏳</div>
                        <div className={styles.featureText}>
                            <h2>水に流す、24時間消滅</h2>
                            <p>
                                すべての投稿は、デフォルトで「24時間で消滅」を選択できます。
                                後に残らないからこそ、今の瞬間の本当の気持ちを綴ることができます。
                            </p>
                            <ul>
                                <li>サーバーからも物理的に削除</li>
                                <li>「今ここ」の感情に集中</li>
                                <li>痕跡を残さない安心感</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🤖</div>
                        <div className={styles.featureText}>
                            <h2>AI哲学者の寄り添い</h2>
                            <p>
                                あなたの投稿に対して、AI哲学者が客観的かつ温かい視点でコメントを返します。
                                単なる共感を越えて、あなたの本音を新しい視点で照らします。
                            </p>
                            <ul>
                                <li>最新のAIによる深い洞察</li>
                                <li>哲学的な対話体験</li>
                                <li>誰にも言えない悩みへの返答</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🌈</div>
                        <div className={styles.featureText}>
                            <h2>感情に同期するUI</h2>
                            <p>
                                投稿時に選んだ感情に合わせて、投稿カードの色合いや雰囲気が変化します。
                                言葉だけでなく、視覚的にもあなたの心の色を表現します。
                            </p>
                            <ul>
                                <li>喜怒哀楽を色で可視化</li>
                                <li>直感的なユーザー体験</li>
                                <li>言葉以上に伝わるフィーリング</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🔒</div>
                        <div className={styles.featureText}>
                            <h2>匿名と安全性の両立</h2>
                            <p>
                                匿名での投稿機能を全ページで提供。
                                一方で、システムレベルでは強固な認証技術を使用し、荒らしや不正利用から場を守ります。
                            </p>
                            <ul>
                                <li>完全に切り離された匿名性</li>
                                <li>Google品質の認証基盤</li>
                                <li>安心できるクローズドな空気感</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.backToTop}>
                    <Link href="/" className="btn-primary" style={{ padding: '1rem 3rem' }}>
                        さっそく、本音を綴る
                    </Link>
                    <div style={{ marginTop: '2rem' }}>
                        <Link href="/about" className={styles.backLink}>← アバウトページへ</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
