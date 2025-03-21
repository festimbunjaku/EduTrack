import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Star, Clock, Calendar, CheckCircle, FileText, Award, Edit, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Teacher',
        href: '/teacher/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/teacher/dashboard',
    },
];

export default function TeacherDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <section className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="relative z-10 flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, Professor!</h1>
                        <p className="max-w-xl text-indigo-100">Manage your courses, track student progress, and create engaging educational content from your dashboard.</p>
                        <div className="mt-3 flex gap-3">
                            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Course
                            </Button>
                            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule
                            </Button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                </section>

                {/* Stats Overview */}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">5</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">+1 new this semester</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">127</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">+23 since last month</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">4.8</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <Star className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">+0.2 points since last semester</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">8</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-amber-500">3 require immediate attention</p>
                        </CardContent>
                    </Card>
                </section>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* My Courses */}
                    <Card className="col-span-2 row-span-2 border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>My Courses</CardTitle>
                                    <CardDescription>Courses you're currently teaching</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Course
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { 
                                        name: "Introduction to Computer Science", 
                                        code: "CS101",
                                        students: 42, 
                                        progress: 65, 
                                        status: "Active"
                                    },
                                    { 
                                        name: "Data Structures & Algorithms", 
                                        code: "CS201",
                                        students: 35, 
                                        progress: 48, 
                                        status: "Active" 
                                    },
                                    { 
                                        name: "Advanced Programming Techniques", 
                                        code: "CS304",
                                        students: 28, 
                                        progress: 30, 
                                        status: "Active" 
                                    },
                                    { 
                                        name: "Web Development Fundamentals", 
                                        code: "CS220",
                                        students: 45, 
                                        progress: 82, 
                                        status: "Active" 
                                    },
                                    { 
                                        name: "Software Engineering Principles", 
                                        code: "CS400",
                                        students: 22, 
                                        progress: 15, 
                                        status: "Active" 
                                    }
                                ].map((course, i) => (
                                    <div key={i} className="rounded-lg border p-4 transition-colors hover:bg-muted/20">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{course.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">{course.code}</span>
                                                    <span className="inline-flex items-center rounded-full border border-transparent bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                        {course.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{course.students}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Course Progress</span>
                                                <span className="font-medium">{course.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-gray-100">
                                                <div 
                                                    className="h-1.5 rounded-full bg-indigo-500" 
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="mr-2 h-3.5 w-3.5" />
                                                Manage
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <FileText className="mr-2 h-3.5 w-3.5" />
                                                Materials
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest actions and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative space-y-4 pl-6">
                                {[
                                    { action: "Graded assignments", course: "CS101", time: "Just now" },
                                    { action: "Updated course materials", course: "CS201", time: "2 hours ago" },
                                    { action: "Replied to student question", course: "CS304", time: "Yesterday" },
                                    { action: "Added new assignment", course: "CS220", time: "2 days ago" }
                                ].map((activity, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-6 mt-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500"></div>
                                        {i < 3 && <div className="absolute -left-5 top-4 h-full w-0.5 bg-gray-200"></div>}
                                        <div className="rounded-lg p-1">
                                            <h4 className="text-sm font-medium">{activity.action}</h4>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Badge variant="outline" className="px-1.5 py-0">{activity.course}</Badge>
                                                <span className="text-muted-foreground">{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Activity</Button>
                        </CardFooter>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                            <CardDescription>Assignments and important dates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { title: "Assignment #3 Due", course: "CS101", date: "Today", urgent: true },
                                    { title: "Midterm Exam", course: "CS201", date: "In 3 days", urgent: true },
                                    { title: "Project Submission", course: "CS304", date: "In 1 week", urgent: false },
                                    { title: "Final Assessment", course: "CS220", date: "In 2 weeks", urgent: false }
                                ].map((deadline, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                            deadline.urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                        }`}>
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">{deadline.title}</h4>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Badge variant="outline" className="px-1.5 py-0">{deadline.course}</Badge>
                                                <span className={`${deadline.urgent ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                                    {deadline.date}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                    </div>
                                ))}
                    </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View Calendar</Button>
                        </CardFooter>
                    </Card>
                </div>
                
                {/* Student Performance */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Student Performance Overview</CardTitle>
                                <CardDescription>Track engagement and grades across your courses</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Export Data</Button>
                                <Button variant="outline" size="sm">Filter</Button>
                    </div>
                </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                                        <th className="px-4 py-3">Course</th>
                                        <th className="px-4 py-3">Enrolled</th>
                                        <th className="px-4 py-3">Attendance</th>
                                        <th className="px-4 py-3">Avg. Grade</th>
                                        <th className="px-4 py-3">Submissions</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { code: "CS101", enrolled: 42, attendance: 92, grade: "A-", submissions: "38/42" },
                                        { code: "CS201", enrolled: 35, attendance: 86, grade: "B+", submissions: "31/35" },
                                        { code: "CS304", enrolled: 28, attendance: 78, grade: "B", submissions: "24/28" },
                                        { code: "CS220", enrolled: 45, attendance: 94, grade: "A", submissions: "43/45" },
                                        { code: "CS400", enrolled: 22, attendance: 82, grade: "B-", submissions: "19/22" }
                                    ].map((course, i) => (
                                        <tr key={i} className="border-b text-sm hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{course.code}</td>
                                            <td className="px-4 py-3">{course.enrolled}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 rounded-full bg-gray-100">
                                                        <div 
                                                            className="h-2 rounded-full bg-emerald-500" 
                                                            style={{ width: `${course.attendance}%` }}
                                                        ></div>
                                                    </div>
                                                    <span>{course.attendance}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-4 w-4 text-amber-500" />
                                                    <span>{course.grade}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{course.submissions}</td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 