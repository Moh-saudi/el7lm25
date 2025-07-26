/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // إعدادات إضافية للتوافق مع Coolify
    trailingSlash: false,
    generateEtags: false,
    images: {
        // تمكين الصور المحلية
        unoptimized: true,
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
    // إضافة إعدادات إضافية للاستقرار
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        // Windows-specific optimizations
        serverComponentsExternalPackages: ['firebase-admin'],
    },
    // تحسين webpack
    webpack: (config, { isServer }) => {
        // تحسين معالجة الصور
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        fallback: 'file-loader',
                    },
                },
            ],
        });
        
        // Windows-specific optimizations
        if (process.platform === 'win32') {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        
        return config;
    },
}

module.exports = nextConfig;
