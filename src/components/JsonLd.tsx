export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Shizunari.",
        "url": "https://henne-sns.vercel.app",
        "description": "喧騒を離れ、心の内なる音に耳を澄ます場所。静寂と本音のSNS",
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
