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
  // Forçar o Next.js a ouvir em todas as interfaces
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
};

export default withMDX(nextConfig);
