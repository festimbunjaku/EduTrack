import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, UserCheck, Clock, Calendar, TrendingUp, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    
    useEffect(() => {
        // Check user roles and redirect to the appropriate dashboard
        if (auth.user) {
            if (auth.user.roles && auth.user.roles.includes('admin')) {
                window.location.href = route('admin.dashboard');
            } else if (auth.user.roles && auth.user.roles.includes('teacher')) {
                window.location.href = route('teacher.dashboard');
            } else if (auth.user.roles && auth.user.roles.includes('student')) {
                window.location.href = route('student.dashboard');
            }
        }
    }, [auth.user]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Section */}
                <section className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {auth.user?.name}!</h1>
                        <p className="text-blue-100">Track your educational progress and manage your courses with ease.</p>
                    </div>
                </section>

                {/* Stats Overview */}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Total Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">12</span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Active Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">156</span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">87%</span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">5</span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Main Content Section */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <Card className="col-span-2 border-0 shadow-md lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest interactions and progress in courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">Completed Module {i}: Introduction to Data Science</h4>
                                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                                        </div>
                                        <Button variant="outline" size="sm">View</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Activity</Button>
                        </CardFooter>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                            <CardDescription>Stay on track with your assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">Assignment {i} Due</h4>
                                            <p className="text-xs text-muted-foreground">In {i} days</p>
                                        </div>
                                        <Button variant="outline" size="sm">Start</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Deadlines</Button>
                        </CardFooter>
                    </Card>
                </section>

                {/* Course Progress */}
                <section>
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle>Course Progress</CardTitle>
                            <CardDescription>Track your progress across all enrolled courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "Introduction to Programming", progress: 85, color: "bg-blue-500" },
                                    { name: "Data Structures and Algorithms", progress: 62, color: "bg-purple-500" },
                                    { name: "Web Development Fundamentals", progress: 45, color: "bg-green-500" },
                                    { name: "Database Management", progress: 30, color: "bg-amber-500" }
                                ].map((course, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">{course.name}</h4>
                                            <p className="text-sm font-medium">{course.progress}%</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div 
                                                className={`h-2 rounded-full ${course.color}`} 
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Courses</Button>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
