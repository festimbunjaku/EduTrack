import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowRight, BookOpen, GraduationCap, Users, Calendar, Award } from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }: PageProps<{ laravelVersion: string, phpVersion: string }>) {
    return (
        <>
            <Head title="EduTrack - Physical Course Management System" />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Navigation */}
                <nav className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">EduTrack</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 py-16 text-center md:py-24">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                        Manage Your <span className="text-indigo-600 dark:text-indigo-400">Physical Courses</span> With Ease
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
                        EduTrack is a comprehensive platform designed to streamline educational management, 
                        making it easy for students, teachers, and administrators to collaborate effectively.
                    </p>
                    <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600 sm:w-auto"
                            >
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600 sm:w-auto"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:w-auto"
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-6 py-16">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                        Designed for Everyone
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Student Card */}
                        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Students</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Access course materials, track assignments, submit homework, and view progress all in one place.
                            </p>
                            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                                    Course enrollment
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                                    Progress tracking
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                                    Assignment submission
                                </li>
                            </ul>
                        </div>

                        {/* Teacher Card */}
                        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Teachers</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Create courses, manage materials, grade assignments, and track student performance.
                            </p>
                            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                                    Course management
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                                    Material creation
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                                    Assignment review
                                </li>
                            </ul>
                        </div>

                        {/* Admin Card */}
                        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Administrators</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Oversee the entire platform, manage users, and make system-wide adjustments.
                            </p>
                            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                    User management
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                    Course approval
                                </li>
                                <li className="flex items-center">
                                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                    System analytics
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="bg-indigo-50 py-16 dark:bg-gray-850">
                    <div className="container mx-auto px-6">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                            Key Features
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-white p-3 shadow-md dark:bg-gray-800">
                                    <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Course Scheduling</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Plan and organize courses with flexible scheduling options
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-white p-3 shadow-md dark:bg-gray-800">
                                    <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Material Management</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Upload and organize course materials for easy access
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-white p-3 shadow-md dark:bg-gray-800">
                                    <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Enrollment System</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Streamlined enrollment with approval workflow
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-white p-3 shadow-md dark:bg-gray-800">
                                    <Award className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Certificates</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Generate and verify course completion certificates
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white py-12 dark:bg-gray-900">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center justify-between md:flex-row">
                            <div className="mb-6 md:mb-0">
                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">EduTrack</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Laravel v{laravelVersion} (PHP v{phpVersion}) | &copy; {new Date().getFullYear()} EduTrack. All rights reserved.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
