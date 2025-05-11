import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome back" description="Enter your credentials to access your account">
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {status}
                </div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email address
                        </Label>
                        <div className="mt-1.5 flex">
                            <div className="pointer-events-none inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                                <Mail className="h-4 w-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                className="rounded-l-none"
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300" 
                                    tabIndex={5}
                                >
                                    Forgot your password?
                                </TextLink>
                            )}
                        </div>
                        <div className="mt-1.5 flex">
                            <div className="pointer-events-none inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                                <Lock className="h-4 w-4" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="rounded-l-none"
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                            />
                            <Label htmlFor="remember" className="text-sm font-medium">
                                Remember me
                            </Label>
                        </div>
                    </div>
                </div>

                <div>
                    <Button 
                        type="submit" 
                        className="relative w-full bg-indigo-600 font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Log in
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <TextLink 
                            href={route('register')} 
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            tabIndex={6}
                        >
                            Sign up now
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
