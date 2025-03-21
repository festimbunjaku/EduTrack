import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock, Award, FileCheck, GraduationCap, BookmarkPlus, TrendingUp, BookOpen as Book, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student',
        href: '/student/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/student/dashboard',
    },
];

export default function StudentDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, Student!</h1>
                        <p className="max-w-2xl text-blue-100">Track your learning journey, manage assignments, and stay on top of your courses.</p>
                        <div className="mt-3 flex gap-3">
                            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                                <BookOpen className="mr-2 h-4 w-4" />
                                My Courses
                            </Button>
                            <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                                <Calendar className="mr-2 h-4 w-4" />
                                Calendar
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
                            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">4</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Book className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">1 new this semester</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">12</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <FileCheck className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-amber-500">3 pending submission</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Average Grade</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">A-</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <Award className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">Up from B+ last semester</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">24.5</div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-emerald-500">+8.5 hours this week</p>
                        </CardContent>
                    </Card>
                </section>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Current Courses */}
                    <Card className="col-span-2 border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Current Courses</CardTitle>
                                    <CardDescription>Track your progress in enrolled courses</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    Browse All Courses
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { 
                                        name: "Introduction to Programming", 
                                        instructor: "Dr. Jane Smith",
                                        progress: 78, 
                                        nextLesson: "Arrays and Loops",
                                        nextDate: "Tomorrow, 10:00 AM"
                                    },
                                    { 
                                        name: "Data Structures and Algorithms", 
                                        instructor: "Prof. Michael Brown",
                                        progress: 45, 
                                        nextLesson: "Linked Lists",
                                        nextDate: "Wednesday, 2:00 PM"
                                    },
                                    { 
                                        name: "Web Development Fundamentals", 
                                        instructor: "Sarah Johnson",
                                        progress: 92, 
                                        nextLesson: "Responsive Design",
                                        nextDate: "Today, 4:00 PM"
                                    },
                                    { 
                                        name: "Database Management", 
                                        instructor: "Dr. Robert Chen",
                                        progress: 32, 
                                        nextLesson: "SQL Joins",
                                        nextDate: "Thursday, 11:00 AM"
                                    }
                                ].map((course, i) => (
                                    <div key={i} className="rounded-lg border p-4 transition-colors hover:bg-muted/20">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                            <div>
                                                <h3 className="font-medium">{course.name}</h3>
                                                <p className="text-xs text-muted-foreground">Instructor: {course.instructor}</p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                {course.progress}% Complete
                                            </Badge>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-2 w-full rounded-full bg-gray-100">
                                                <div 
                                                    className="h-2 rounded-full bg-blue-500" 
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Next: {course.nextLesson}</span>
                                                <span className="text-muted-foreground">• {course.nextDate}</span>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Continue Learning
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View All Enrolled Courses</Button>
                        </CardFooter>
                    </Card>

                    {/* Upcoming Assignments */}
                    <div className="flex flex-col gap-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Upcoming Assignments</CardTitle>
                                <CardDescription>Don't miss your deadlines</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { title: "Programming Assignment 2", course: "CS101", due: "Today", urgent: true },
                                        { title: "Algorithm Analysis", course: "CS201", due: "Tomorrow", urgent: true },
                                        { title: "Web Project Phase 1", course: "CS220", due: "In 3 days", urgent: false },
                                        { title: "Database Query Design", course: "CS330", due: "Next week", urgent: false }
                                    ].map((assignment, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                                assignment.urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                            }`}>
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium">{assignment.title}</h4>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Badge variant="outline" className="px-1.5 py-0">{assignment.course}</Badge>
                                                    <span className={`${assignment.urgent ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                                        Due: {assignment.due}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">Start</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">View All Assignments</Button>
                            </CardFooter>
                        </Card>

                        {/* Learning Resources */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Learning Resources</CardTitle>
                                <CardDescription>Additional materials to help you excel</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { title: "Programming Fundamentals eBook", type: "E-Book", course: "CS101" },
                                        { title: "Algorithm Visualization Tool", type: "Interactive", course: "CS201" },
                                        { title: "Web Dev Framework Tutorial", type: "Video", course: "CS220" },
                                        { title: "SQL Practice Problems", type: "Exercise", course: "CS330" }
                                    ].map((resource, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                                            <BookmarkPlus className="h-4 w-4 text-blue-600" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium">{resource.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{resource.type}</span>
                                                    <span>•</span>
                                                    <span>{resource.course}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                    </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">Browse Library</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                
                {/* Learning Progress */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Learning Progress</CardTitle>
                                <CardDescription>Your academic journey at a glance</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Course Completion</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: "Term 1 Courses", completed: 100, total: 3, color: "bg-emerald-500" },
                                        { name: "Term 2 Courses", completed: 100, total: 4, color: "bg-emerald-500" },
                                        { name: "Current Term", completed: 2, total: 4, color: "bg-blue-500" },
                                        { name: "Overall Degree Progress", completed: 48, total: 120, color: "bg-indigo-500" }
                                    ].map((term, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium">{term.name}</h4>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span className="font-medium">{term.completed}</span>
                                                    <span className="text-muted-foreground">/ {term.total} credits</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100">
                                                <div 
                                                    className={`h-2 rounded-full ${term.color}`} 
                                                    style={{ width: `${(term.completed / term.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                    </div>
                </div>
                
                            <div>
                                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Skills Development</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: "Programming", level: 75, color: "bg-blue-500" },
                                        { name: "Data Analysis", level: 60, color: "bg-purple-500" },
                                        { name: "Web Development", level: 85, color: "bg-emerald-500" },
                                        { name: "Database Management", level: 45, color: "bg-amber-500" }
                                    ].map((skill, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium">{skill.name}</h4>
                                                <p className="text-sm font-medium">{skill.level}%</p>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100">
                                                <div 
                                                    className={`h-2 rounded-full ${skill.color}`} 
                                                    style={{ width: `${skill.level}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                    </div>
                </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            View Complete Academic Record
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
} 