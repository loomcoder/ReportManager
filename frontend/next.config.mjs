/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        // Correctly identify backend port. 
        // When running locally, backend is on 3025. Frontend is on 3050.
        // process.env.PORT might be polluted or set to 3050 by next dev.
        // We should read BACKEND_PORT or default to 3025 explicitly.
        const BACKEND_URL = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'http://report-manager-backend:3025' : 'http://localhost:3025');

        console.log(`[Next.js] Rewriting /api requests to: ${BACKEND_URL}`);
        return [
            {
                source: '/api/:path*',
                destination: `${BACKEND_URL}/:path*`,
            },
            {
                source: '/logs',
                destination: `${BACKEND_URL}/logs`,
            },
        ];
    },
};

export default nextConfig;
