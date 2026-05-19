import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // Configuração para produção
  output: 'standalone',
  experimental: {
    outputStandingMode: true,
  },
};

export default withMDX(nextConfig);
