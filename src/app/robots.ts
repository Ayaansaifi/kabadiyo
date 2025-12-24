import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/profile/', '/api/'],
        },
        sitemap: 'https://kabadiwala.app/sitemap.xml',
    }
}
