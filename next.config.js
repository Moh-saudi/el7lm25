/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: [],
        appDir: true,
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'localhost',
            'storage.googleapis.com',
            'lh3.googleusercontent.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    reactStrictMode: true,
    swcMinify: true,
    optimizeFonts: false,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://api.merchant.geidea.net https://checkout.geidea.net",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.merchant.geidea.net",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: https: blob:",
                            "connect-src 'self' https://api.merchant.geidea.net https://www.merchant.geidea.net https://checkout.geidea.net wss: ws:",
                            "frame-src 'self' https://www.merchant.geidea.net https://api.merchant.geidea.net https://checkout.geidea.net https://gateway.mastercard.com https://ap.gateway.mastercard.com",
                            "frame-ancestors 'self' https://www.merchant.geidea.net https://checkout.geidea.net",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self' https://www.merchant.geidea.net https://api.merchant.geidea.net"
                        ].join('; ')
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Correlation-ID' },
                    { key: 'Access-Control-Expose-Headers', value: 'X-Correlation-ID' }
                ],
            },
        ]
    },
}

module.exports = nextConfig