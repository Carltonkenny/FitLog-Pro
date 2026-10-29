import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Only these public values reach the browser. DATABASE_URL, NEON_REALTIME_SECRET and every other
// secret keep their names out of this list, so Vite never bundles them.
const PUBLIC_ENV = ['VITE_', 'NEON_AUTH_BASE_URL', 'NEON_FUNCTION_', 'NEON_REALTIME_URL'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // The browser talks to Neon Auth through /neon-auth on our own domain, so the session cookie is
  // first-party. Cross-site cookies are blocked by iPhone Safari. In production Netlify does the same
  // rewrite (see netlify.toml); this is the dev and preview equivalent.
  let proxy;
  if (env.NEON_AUTH_BASE_URL) {
    const auth = new URL(env.NEON_AUTH_BASE_URL);
    const base = auth.pathname.replace(/\/$/, '');
    proxy = {
      '/neon-auth': { target: auth.origin, changeOrigin: true, rewrite: (p) => p.replace(/^\/neon-auth/, base) },
    };
  }

  return {
    plugins: [tailwindcss(), react()],
    envPrefix: PUBLIC_ENV,
    server: { port: 5173, host: true, proxy },
    preview: { proxy },
  };
});
