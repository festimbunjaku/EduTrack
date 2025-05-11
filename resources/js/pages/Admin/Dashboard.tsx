import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, School, Settings, Activity, AlertTriangle, TrendingUp, Star, BarChart } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header Section */}
                <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Comprehensive overview of your educational platform</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Activity className="mr-2 h-4 w-4" />
                            View Logs
                        </Button>
                    </div>
                </section>

                {/* Stats Overview */}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">215</div>
                                    <div className="text-xs text-emerald-500">+12% from last month</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">24</div>
                                    <div className="text-xs text-emerald-500">+3 new this month</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                    <School className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">18</div>
                                    <div className="text-xs text-emerald-500">+2 new this month</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">System Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">2</div>
                                    <div className="text-xs text-amber-500">Requires attention</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Main Content Section */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* User Activity */}
                    <Card className="col-span-2 row-span-2 border-0 shadow-sm lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>User Activity</CardTitle>
                                    <CardDescription>Overview of platform activity over time</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Weekly</Button>
                                    <Button variant="outline" size="sm">Monthly</Button>
                                    <Button variant="default" size="sm">Yearly</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 w-full">
                                {/* Chart Placeholder */}
                                <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                                    <div>
                                        <BarChart className="mx-auto h-16 w-16 text-muted-foreground/60" />
                                        <p className="mt-2 text-sm font-medium">User activity chart will be displayed here</p>
                                        <p className="text-xs text-muted-foreground">Showing monthly statistics for user logins, course enrollments, and completions</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Registrations */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                            <CardDescription>New users in the last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "John Doe", role: "Student", time: "2 hours ago" },
                                    { name: "Jane Smith", role: "Teacher", time: "5 hours ago" },
                                    { name: "Robert Johnson", role: "Student", time: "1 day ago" },
                                    { name: "Emma Williams", role: "Student", time: "2 days ago" },
                                ].map((user, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                            user.role === "Student" ? "bg-blue-100 text-blue-600" : "bg-violet-100 text-violet-600"
                                        }`}>
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">{user.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    user.role === "Student" ? "bg-blue-100 text-blue-800" : "bg-violet-100 text-violet-800"
                                                }`}>
                                                    {user.role}
                                                </span>
                                                <p className="text-xs text-muted-foreground">{user.time}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Users</Button>
                        </CardFooter>
                    </Card>
                </section>

                {/* Course Overview Section */}
                <section>
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Course Overview</CardTitle>
                                    <CardDescription>Performance metrics for active courses</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">View All Courses</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                                            <th className="px-4 py-3">Course Name</th>
                                            <th className="px-4 py-3">Instructor</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3">Completion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: "Web Development Fundamentals", instructor: "Sarah Johnson", students: 32, completion: 78 },
                                            { name: "Advanced Data Science", instructor: "Michael Chen", students: 24, completion: 65 },
                                            { name: "UX/UI Design Principles", instructor: "Emily Rodriguez", students: 29, completion: 92 },
                                            { name: "Mobile App Development", instructor: "David Kim", students: 18, completion: 45 },
                                        ].map((course, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="font-medium">{course.name}</div>
                                                        <div className="text-xs text-muted-foreground">3 months duration</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{course.instructor}</td>
                                                <td className="px-4 py-3">{course.students}</td>
                                                <td className="px-4 py-3">
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                                <div className={`h-full ${
                                                                    course.completion > 75 ? "bg-emerald-500" : 
                                                                    course.completion > 50 ? "bg-blue-500" : 
                                                                    "bg-amber-500"
                                                                }`} style={{ width: `${course.completion}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-medium">{course.completion}%</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
} 