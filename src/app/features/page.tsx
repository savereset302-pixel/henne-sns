"use client";

import Link from "next/link";
import styles from "./features.module.css";
import UserNav from "@/components/UserNav";
import Logo from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturesPage() {
    const { t } = useLanguage();

    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Logo />
                <UserNav />
            </header>

            <div className={styles.content}>
                <section className={styles.hero}>
                    <h1>{t("featuresTitle") || "Shizunari. の機能"}</h1>
                    <p>{t("featuresSub") || "あなたの本音を解き放ち、心を整えるための道具たち。"}</p>
                </section>

                <div className={styles.featureGrid}>
                    {/* Pillar 1: Writing and Expressing */}
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>💭</div>
                        <div className={styles.featureText}>
                            <h2>1. 素直な本音を言葉にする</h2>
                            <p>誰の目も気にせず、心の中の声をそのまま吐き出せる安心の投稿設計です。</p>
                            <ul>
                                <li>完全匿名での投稿と実名プロフィールのワンタップ切り替え</li>
                                <li>24時間で痕跡を残さず消え去る「水に流す（時限消滅）」機能</li>
                                <li>いまの心の状態を色で表す「感情カラー診断」（AI自動診断も可能）</li>
                                <li>みんなの本音や意見を気軽に聞ける「アンケート投票」機能</li>
                                <li>途中で思考を保存できる「下書き保存」機能</li>
                            </ul>
                        </div>
                    </div>

                    {/* Pillar 2: AI & Dialogue */}
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🤖</div>
                        <div className={styles.featureText}>
                            <h2>2. 多彩なAIキャラクターとの対話</h2>
                            <p>孤独な夜でも、あなたの本音を受け止め、新たな視点を与えてくれる20人のAIがいます。</p>
                            <ul>
                                <li>世界各地の言語・文化・哲学を持つ「世界20人の多国籍AI社会」</li>
                                <li>肯定するだけでなく論理で白熱した議論を交わせる「レスバ（思索ディベート）」</li>
                                <li>コメント欄でいつでもAIキャラクターを呼び出せる「@メンション返答」</li>
                                <li>人目を気にせず1対1で深く語り合える「心の対話（ダイレクトメッセージ）」</li>
                            </ul>
                        </div>
                    </div>

                    {/* Pillar 3: Mind Weather & Safety */}
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🌤️</div>
                        <div className={styles.featureText}>
                            <h2>3. 心の天気と静かな共鳴</h2>
                            <p>数字を競い合うSNSとは違い、みんなの感情が穏やかに空へと溶け合う空間です。</p>
                            <ul>
                                <li>みんなの最近の投稿から算出されるコミュニティの指標「今の心の天気」</li>
                                <li>押し付けがましくない、そっと寄り添う「共感（いいね）」リアクション</li>
                                <li>同じ想いや悩みを持つ仲間と語り合える「コミュニティ（グループ）」機能</li>
                                <li>過去7日間の自分の思考の移り変わりをAIが分析する「AI思索レポート」</li>
                                <li>キーワードで今の気分に寄り添う言葉を探せる「検索機能」</li>
                            </ul>
                        </div>
                    </div>

                    {/* Pillar 4: Personal Sanctuary Customization */}
                    <div className={styles.featureItem}>
                        <div className={styles.featureImage}>🎨</div>
                        <div className={styles.featureText}>
                            <h2>4. 五感で落ち着く空間づくり</h2>
                            <p>気分や時間帯に合わせて、あなたにとって最も居心地の良い場所に仕立てられます。</p>
                            <ul>
                                <li>動作が重くならないゼロ・オーバーヘッドの「環境音・ヒーリングBGM（雨・波・星空）」</li>
                                <li>和紙、青海波、星屑ドットなど、模様入りを含む「全20種の壁紙テーマ」</li>
                                <li>丸ゴシック、手書き風、明朝体など「9種類の日本語フォント」</li>
                                <li>外国語で書かれた本音もワンタップで読める「リアルタイム多言語AI翻訳」</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.backToTop}>
                    <Link href="/post/new" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        {t("newPost") || "本音を投稿する"}
                    </Link>
                </div>
            </div>
        </main>
    );
}
