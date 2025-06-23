/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: [],
        optimizeCss: false,
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'localhost',
            'storage.googleapis.com',
            'lh3.googleusercontent.com',
            'ekyerljzfokqimbabzxm.supabase.co'
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
            {
                protocol: 'https',
                hostname: 'ekyerljzfokqimbabzxm.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            }
        ],
        // إعدادات معالجة الأخطاء المحسنة
        dangerouslyAllowSVG: false,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        // تعطيل التحسين للصور لحل مشكلة الـ loader
        unoptimized: true,
        // إعدادات Cache محسنة
        minimumCacheTTL: 60,
        formats: ['image/webp', 'image/avif'],
        // فلترة الروابط المكسورة
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    reactStrictMode: true,
    swcMinify: true,
    optimizeFonts: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: https://www.youtube.com https://youtube.com https://www.googletagmanager.com",
                            "style-src 'self' 'unsafe-inline' https: data:",
                            "font-src 'self' https: data:",
                            "img-src 'self' data: https: blob: https://i.ytimg.com https://img.youtube.com",
                            "media-src 'self' https: data: blob: https://www.youtube.com https://youtube.com https://*.googlevideo.com https://*.ytimg.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
                            "connect-src 'self' https: wss: ws: data: https://www.youtube.com https://youtube.com https://*.googlevideo.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
                            "frame-src 'self' https: https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
                            "child-src 'self' https: https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
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
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        
        // Optimize CSS handling to prevent preload warnings
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks.cacheGroups,
                    styles: {
                        name: 'styles',
                        test: /\.(css|scss|sass)$/,
                        chunks: 'all',
                        enforce: true,
                        priority: 10,
                    },
                },
            },
        };
        
        return config;
    },
}

module.exports = nextConfig