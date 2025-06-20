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
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
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
                            "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
                            "style-src 'self' 'unsafe-inline' https: data:",
                            "font-src 'self' https: data:",
                            "img-src 'self' data: https: blob:",
                            "connect-src 'self' https: wss: ws: data:",
                            "frame-src 'self' https:",
                            "frame-ancestors 'self' https:",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self' https:"
                        ].join('; ')
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL'
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*'
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: '*'
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: '*'
                    },
                    {
                        key: 'Access-Control-Expose-Headers',
                        value: '*'
                    }
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: '*' },
                    { key: 'Access-Control-Allow-Headers', value: '*' },
                    { key: 'Access-Control-Expose-Headers', value: '*' },
                    { key: 'X-Frame-Options', value: 'ALLOWALL' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }
                ],
            },
            {
                source: '/(.*geidea.*|.*payment.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; frame-src *; frame-ancestors *;"
                    },
                    { key: 'X-Frame-Options', value: 'ALLOWALL' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Headers', value: '*' },
                    { key: 'Access-Control-Expose-Headers', value: '*' }
                ],
            },
        ]
    },
}

module.exports = nextConfig