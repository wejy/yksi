import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@yksi/ui', '@yksi/core', '@yksi/db', '@yksi/integrations'],
}

export default nextConfig
