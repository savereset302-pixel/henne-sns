import Link from "next/link";
import styles from "./Logo.module.css";

interface LogoProps {
    showTagline?: boolean;
    className?: string;
}

export default function Logo({ showTagline = false, className = "" }: LogoProps) {
    return (
        <Link href="/" className={`${styles.logoLink} ${className}`} aria-label="Shizunari. トップへ">
            <div className={styles.iconContainer}>
                <svg
                    className={styles.svgIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="shizuDrop" x1="12" y1="3.5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#67e8f9" />
                            <stop offset="0.5" stopColor="#38bdf8" />
                            <stop offset="1" stopColor="#0ea5e9" />
                        </linearGradient>
                        <linearGradient id="shizuWave" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#38bdf8" />
                            <stop offset="1" stopColor="#22d3ee" />
                        </linearGradient>
                        <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.6" />
                        </filter>
                    </defs>

                    {/* Concentric sound ripple / water waves (静けさに広がる波紋音波) */}
                    <path
                        d="M3.5 9.5C2.5 11 2 12.8 2 14C2 15.6 2.6 17.2 3.8 18.5"
                        stroke="url(#shizuWave)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M20.5 9.5C21.5 11 22 12.8 22 14C22 15.6 21.4 17.2 20.2 18.5"
                        stroke="url(#shizuWave)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />

                    {/* Water surface ripple base (水琴窟の波紋) */}
                    <ellipse
                        cx="12"
                        cy="19.5"
                        rx="5.5"
                        ry="1.6"
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeOpacity="0.6"
                        strokeDasharray="2 1.5"
                    />

                    {/* Central Water Drop (澄んだ本音の一滴) */}
                    <path
                        d="M12 3.8C12 3.8 6.8 9.8 6.8 13.8C6.8 16.7 9.1 19 12 19C14.9 19 17.2 16.7 17.2 13.8C17.2 9.8 12 3.8 12 3.8Z"
                        fill="url(#shizuDrop)"
                        filter="url(#glowDrop)"
                    />
                    {/* Clear light reflection (光のハイライト) */}
                    <ellipse cx="10" cy="11.5" rx="1.4" ry="2.2" transform="rotate(-25 10 11.5)" fill="#ffffff" fillOpacity="0.9" />
                </svg>
            </div>

            <div className={styles.textGroup}>
                <span className={styles.brandName}>
                    Shizunari<span className={styles.dot}>.</span>
                </span>
                {showTagline && <span className={styles.tagline}>静寂と本音のSNS</span>}
            </div>
        </Link>
    );
}
