/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'localhost',
            'lh3.googleusercontent.com',
            'ekyerljzfokqimbabzxm.supabase.co'
        ],
        // تحسين معالجة الصور
        unoptimized: false,
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ekyerljzfokqimbabzxm.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            }
        ],
    },
    // تحسين الأداء العام
    compress: true,
    poweredByHeader: false,
    // إصلاح تكوين external packages
    serverExternalPackages: ['@firebase/admin'],
}

module.exports = nextConfig;
