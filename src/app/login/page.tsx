import AuthForm from "@/components/AuthForm";
import styles from "./login.module.css";
import Logo from "@/components/Logo";

export default function LoginPage() {
    return (
        <main className="container">
            <header className={styles.header}>
                <Logo />
            </header>
            <section className={styles.content}>
                <AuthForm />
            </section>
        </main>
    );
}
