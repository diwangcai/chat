import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@modelcontextprotocol/server-filesystem'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), './')
    }
    return config
  }
}

export default nextConfig
