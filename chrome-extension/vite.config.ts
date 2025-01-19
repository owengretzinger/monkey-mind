import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    envDir: resolve(__dirname),  // This tells Vite where to look for .env files
    // ... rest of your config
}); 