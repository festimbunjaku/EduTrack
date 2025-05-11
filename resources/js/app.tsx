import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        try {
            // For absolute paths like 'Dashboard', 'AdminDashboard'
            const pages = import.meta.glob('./pages/**/*.tsx');
            
            // Try direct match first
            const match = `./pages/${name}.tsx`;
            if (pages[match]) {
                return await pages[match]();
            }
            
            // If not found, try in subdirectories
            for (const path in pages) {
                const fileName = path.split('/').pop()?.replace('.tsx', '');
                if (fileName === name) {
                    return await pages[path]();
                }
            }
            
            console.error(`Page not found: ${name}, available pages:`, Object.keys(pages));
            throw new Error(`Page not found: ${name}`);
        } catch (error) {
            console.error(`Failed to resolve page: ${name}`, error);
            throw error;
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
