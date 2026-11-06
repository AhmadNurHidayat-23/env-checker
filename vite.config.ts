import { defineConfig } from 'vitest/config';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [laravel({input:['resources/js/main.ts'],refresh:true}),tailwindcss()], test:{include:['resources/js/**/*.test.ts']} });
