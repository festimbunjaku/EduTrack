import { SidebarInset } from '@/components/ui/sidebar';
import { FlashMessage } from '@/components/flash-message';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    const content = (
        <>
            <div className="px-4">
                <FlashMessage />
            </div>
            {children}
        </>
    );

    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{content}</SidebarInset>;
    }

    return (
        <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl" {...props}>
            {content}
        </main>
    );
}
