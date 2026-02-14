import AuthForm from "@/components/AuthForm";
import styles from "./login.module.css";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="container">
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Honne.</Link>
            </header>
            <section className={styles.content}>
                <AuthForm />
            </section>
        </main>
    );
}
