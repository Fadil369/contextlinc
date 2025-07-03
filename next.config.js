/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Environment configuration for context.thefadil.site
  env: {
    NEXT_PUBLIC_APP_URL: 'https://context.thefadil.site',
    NEXT_PUBLIC_APP_NAME: 'ContextLinc',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Next-generation context engineering platform',
  },
  // Exclude problematic directories and files
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'workers/**/*',
        '**/.wrangler/**/*',
        '**/node_modules/@swc/core-linux-x64-gnu/**/*',
        '**/node_modules/@swc/core-linux-x64-musl/**/*',
        '**/node_modules/@swc/core-darwin-arm64/**/*',
        '**/node_modules/@swc/core-darwin-x64/**/*',
        '**/node_modules/webpack/**/*',
        '**/node_modules/@next/swc-*/**/*'
      ],
    },
  },
  // Exclude workers from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Ignore workers directory during webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/workers/**',
        '**/.wrangler/**',
        '**/node_modules/**'
      ]
    };
    
    return config;
  },
  // For static export, we can't use headers
  distDir: 'out',
};

module.exports = nextConfig;