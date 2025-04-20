import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tsconfigPaths(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
      },
      '/trpc': {
        target: 'http://localhost:3001',
      },
      '/ws': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
