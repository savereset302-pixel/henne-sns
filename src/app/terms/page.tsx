import Link from "next/link";
import styles from "../privacy/legal.module.css";

export default function TermsPage() {
    return (
        <main className="container fade-in">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
            </header>

            <section className={styles.content}>
                <h1>利用規約</h1>
                <p>この利用規約は、Honne.（以下「当サービス」）の利用条件を定めるものです。</p>

                <h2>1. 禁止事項</h2>
                <p>当サービスを利用するにあたり、以下の行為を禁止します：</p>
                <ul>
                    <li>他者への誹謗中傷、嫌がらせ、名誉毀損行為</li>
                    <li>公序良俗に反する内容の投稿</li>
                    <li>他者のプライバシーを侵害する情報の掲載</li>
                    <li>スパム、広告、勧誘目的の投稿</li>
                    <li>自動化ツール（ボット等）を用いた不正な操作</li>
                    <li>その他、運営が不適切と判断する行為</li>
                </ul>

                <h2>2. 投稿内容の権利と管理</h2>
                <p>ユーザーが投稿した内容の著作権はユーザーに帰属します。ただし、当サービス内の機能（表示、AIによる分析、コメント生成）のために無償で使用することを許諾するものとします。</p>

                <h2>3. 投稿の削除</h2>
                <p>運営は、禁止事項に該当する場合やシステムの保守上必要な場合、ユーザーに通知することなく投稿を削除できるものとします。また、ユーザーが「24時間で消去」を選択した投稿は、自動的に削除されます。</p>

                <h2>4. 免責事項</h2>
                <p>当サービスは学習および実験目的のプロジェクトです。サービスの中断、データの消失、投稿内容によって生じた損害について、運営者は一切の責任を負わないものとします。</p>

                <h2>5. 規約の変更</h2>
                <p>当サービスは、必要に応じて本規約を変更することがあります。変更後の規約はサイト上に掲載した時点で効力が発生します。</p>

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
