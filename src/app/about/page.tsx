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

                <div className={styles.action}>
                    <Link href="/">
                        <button className="btn-primary">本音を綴る</button>
                    </Link>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>&copy; 2026 Honne Sharing SNS.</p>
            </footer>
        </main>
    );
}
