import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/admin-init/'],
        },
        sitemap: 'https://shizunari-sns.vercel.app/sitemap.xml',
    }
}
