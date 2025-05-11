import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 lg:bg-gray-50 dark:lg:bg-gray-900/20"></div>
            <div className="container relative grid h-screen w-full flex-1 grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block">
                    <div className="relative flex h-full flex-col items-center justify-center rounded-e-2xl bg-gradient-to-b from-blue-500 to-blue-600 p-8 text-white">
                        <div className="absolute inset-0 bg-cover bg-center opacity-10"></div>
                        <div className="relative z-20 flex items-center">
                            <AppLogoIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="relative z-20 mt-auto">
                            <blockquote className="space-y-2">
                                <p className="text-lg">EduTrack has transformed how we manage our educational content and track student progress.</p>
                                <footer className="text-sm">Julia Chen, Education Director</footer>
                            </blockquote>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center lg:p-8">
                    <div className="w-full max-w-sm lg:max-w-md">
                        <div className="bg-background mx-auto mb-4 flex h-8 w-8 items-center justify-center lg:hidden">
                            <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                                <AppLogoIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </Link>
                        </div>
                        <div className="mb-4 flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground text-sm">{description}</p>
                        </div>
                        <div className="flex flex-col space-y-4">
                            {children}
                            <div className="mt-4 hidden items-center justify-center gap-2 lg:flex">
                                <div className="flex flex-col items-center gap-2">
                                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                                        <AppLogoIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
