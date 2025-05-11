import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create your account" description="Join EduTrack to manage your educational journey">
            <Head title="Register" />
            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </Label>
                        <div className="mt-1.5 flex">
                            <div className="pointer-events-none inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                className="rounded-l-none"
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="John Doe"
                            />
                        </div>
                        <InputError message={errors.name} className="mt-1" />
                    </div>

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
                                className="rounded-l-none"
                                tabIndex={2}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="name@example.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="mt-1.5 flex">
                            <div className="pointer-events-none inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                                <Lock className="h-4 w-4" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="rounded-l-none"
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="text-sm font-medium">
                            Confirm password
                        </Label>
                        <div className="mt-1.5 flex">
                            <div className="pointer-events-none inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                                <Lock className="h-4 w-4" />
                            </div>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                className="rounded-l-none"
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        className="relative w-full bg-indigo-600 font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create account
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <TextLink
                            href={route('login')}
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            tabIndex={6}
                        >
                            Log in
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
