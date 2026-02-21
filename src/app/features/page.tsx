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
                        <div className={styles.featureImage}>👥</div>
                        <div className={styles.featureText}>
                            <h2>コミュニティ (グループチャット)</h2>
                            <p>共通の興味や想いを持つ人々が集える、リアルタイムな交流空間です。</p>
                            <ul>
                                <li>誰でも自由にチャットルームを作成可能</li>
                                <li>Firestore による瞬時のメッセージ同期</li>
                                <li>同じ悩みや喜びを分かち合う場所</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`glass-panel ${styles.featureCard}`}>
                            <div className={styles.icon}>🖼️</div>
                            <div>
                                <h3>画像投稿 (最適化済み)</h3>
                                <p>あなたの想いに彩りを添える画像を投稿できます。デバイス側で自動的に軽量化処理を行うため、通信量を抑えつつスムーズにアップロード可能です。</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`glass-panel ${styles.featureCard}`}>
                            <div className={styles.icon}>🌐</div>
                            <div>
                                <h3>多言語・AI翻訳機能</h3>
                                <p>日本語だけでなく、英語、スペイン語、中国語に対応。設定を切り替えると、他のユーザーの投稿もAIがあなたの言語へ自動的に翻訳します。世界中の「本音」に触れてみましょう。</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🎨</div>
                        <div className={styles.featureText}>
                            <h2>テーマシステム</h2>
                            <p>あなたの心の状態や好みに合わせて、背景色やテキストの配色を自由に変更できます。</p>
                            <ul>
                                <li>4種類のテーマ（ダーク、ホワイト、生成色、夕暮れ）</li>
                                <li>サイト全体の雰囲気が一瞬で切り替わります</li>
                                <li>全ページで一貫したテーマ適用</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🔖</div>
                        <div className={styles.featureText}>
                            <h2>しおり & 下書き</h2>
                            <p>大切な言葉を手元に残し、自分の想いをじっくり温めるための機能です。</p>
                            <ul>
                                <li>気に入った本音を「しおり」で保存</li>
                                <li>未完成な想いを「下書き」として一時保存</li>
                                <li>詳細ページからワンタップでしおり登録</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🧞</div>
                        <div className={styles.featureText}>
                            <h2>AI哲学者</h2>
                            <p>あなたの本音に寄り添うAIの分析と、心地よい距離感のための制限機能。</p>
                            <ul>
                                <li>AIによる感情カラーの自動診断</li>
                                <li>文脈を汲み取った血の通ったAIコメント</li>
                                <li>「人間のみ許可」設定で静かな場所を守る</li>
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
