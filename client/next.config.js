/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:3001/api/users/:path*',
      },
      {
        source: '/api/tickets/:path*',
        destination: 'http://localhost:3000/api/tickets/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://localhost:3002/api/orders/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://localhost:3004/api/payments/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
