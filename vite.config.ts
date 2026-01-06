// vite.config.ts
 
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.resolve(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
});