export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Honne.",
        "url": "https://henne-sns.vercel.app",
        "description": "世間の目を気にせず、あなたの本音や哲学を共有するSNS",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://henne-sns.vercel.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
