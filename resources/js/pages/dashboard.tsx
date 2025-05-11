import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    BookOpen, 
    Users, 
    UserCheck, 
    Clock, 
    Calendar, 
    TrendingUp, 
    GraduationCap,
    FileText,
    CheckCircle,
    Clock3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Course {
    id: number;
    title: string;
    description: string;
    status: string;
    teacher: {
        name: string;
    };
    students_count?: number;
    completion_percentage?: number;
    start_date: string;
    end_date: string;
}

interface HomeworkAssignment {
    id: number;
    title: string;
    description: string;
    due_date: string;
    course: {
        id: number;
        title: string;
    };
    status: string;
}

interface DashboardProps {
    userRole: 'student' | 'teacher' | 'admin';
    enrolledCourses: Course[];
    teacherCourses: Course[];
    pendingHomework: HomeworkAssignment[];
    pendingReviews?: HomeworkAssignment[];
    stats?: {
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        completionRate: number;
    };
    recentActivity: {
        id: number;
        type: string;
        description: string;
        created_at: string;
    }[];
}

// Simple error boundary component to catch rendering errors
function SafeRender({ children }: { children: React.ReactNode }) {
    try {
        return <>{children}</>;
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-gray-600">There was an error rendering this component.</p>
            </div>
        );
    }
}

export default function Dashboard({
    userRole = 'student',
    enrolledCourses = [],
    teacherCourses = [],
    pendingHomework = [],
    pendingReviews = [],
    stats = {
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        completionRate: 0
    },
    recentActivity = []
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }).format(date);
    };
    
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500';
            case 'upcoming':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-purple-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };
    
    const getDaysUntil = (dateString: string) => {
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    
    const getRelativeTimeString = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        
        if (diffSeconds < 60) {
            return 'just now';
        } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffSeconds < 86400) {
            const hours = Math.floor(diffSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    const memoizedRecentActivity = useMemo(() => recentActivity, [recentActivity]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <SafeRender>
                <div className="flex flex-col gap-6 p-6">
                    {/* Welcome Section */}
                    <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {auth.user?.name}!</h1>
                            <p className="text-indigo-100">
                                {userRole === 'student' && 'Track your educational progress and manage your courses.'}
                                {userRole === 'teacher' && 'Manage your courses and review student work.'}
                                {userRole === 'admin' && 'Monitor the platform and manage users and courses.'}
                            </p>
                        </div>
                    </section>

                    {/* Stats Overview */}
                    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {userRole === 'admin' && (
                            <>
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Total Users</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{stats.totalUsers}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                                <Users className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Total Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{stats.totalCourses}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Total Enrollments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{stats.totalEnrollments}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                <UserCheck className="h-6 w-6" />
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
                                            <span className="text-3xl font-bold">{stats.completionRate}%</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {userRole === 'teacher' && (
                            <>
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Your Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{(teacherCourses || []).length}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Total Students</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">
                                                {(teacherCourses || []).reduce((sum, course) => sum + (course.students_count || 0), 0)}
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                <Users className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Pending Reviews</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{pendingReviews?.length || 0}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Active Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">
                                                {(teacherCourses || []).filter(c => c.status?.toLowerCase() === 'active').length}
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {userRole === 'student' && (
                            <>
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Enrolled Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{(enrolledCourses || []).length}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Active Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">
                                                {(enrolledCourses || []).filter(c => c.status?.toLowerCase() === 'active').length}
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Pending Homework</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">{(pendingHomework || []).length}</span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">Average Progress</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold">
                                                {(enrolledCourses || []).length > 0 
                                                    ? Math.round((enrolledCourses || []).reduce((sum, course) => sum + (course.completion_percentage || 0), 0) / enrolledCourses.length) 
                                                    : 0}%
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </section>

                    {/* Main Content */}
                    <section className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Recent Activity */}
                        <Card className="col-span-2 border-0 shadow-md">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest activities and updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {memoizedRecentActivity && memoizedRecentActivity.length > 0 ? (
                                        memoizedRecentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10`}>
                                                    {activity.type === 'submission' && <FileText className="h-5 w-5 text-primary" />}
                                                    {activity.type === 'enrollment' && <UserCheck className="h-5 w-5 text-primary" />}
                                                    {activity.type === 'course' && <BookOpen className="h-5 w-5 text-primary" />}
                                                    {activity.type === 'user' && <Users className="h-5 w-5 text-primary" />}
                                                    {!activity.type && <Clock3 className="h-5 w-5 text-primary" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{activity.description || "Activity"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.created_at ? getRelativeTimeString(activity.created_at) : "Recently"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">No Recent Activity</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Activity will appear here as you use the platform.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">View All Activity</Button>
                            </CardFooter>
                        </Card>

                        {/* Right Column - Role Specific Content */}
                        <Card className="border-0 shadow-md">
                            {userRole === 'student' && (
                                <>
                                    <CardHeader>
                                        <CardTitle>Pending Homework</CardTitle>
                                        <CardDescription>Assignments that need your attention</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {pendingHomework.length > 0 ? (
                                                pendingHomework.map((homework) => (
                                                    <div key={homework.id} className="flex items-start gap-4 rounded-lg border p-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium">{homework.title}</h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                {homework.course.title} • Due {formatDate(homework.due_date)}
                                                            </p>
                                                        </div>
                                                        <Badge variant={getDaysUntil(homework.due_date) < 3 ? "destructive" : "outline"}>
                                                            {getDaysUntil(homework.due_date) <= 0 
                                                                ? "Overdue" 
                                                                : `${getDaysUntil(homework.due_date)} day${getDaysUntil(homework.due_date) !== 1 ? 's' : ''} left`}
                                                        </Badge>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                                    <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                                                    <h3 className="text-lg font-medium">No pending homework</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        You're all caught up!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={route('student.homework.index')}>View All Homework</Link>
                                        </Button>
                                    </CardFooter>
                                </>
                            )}

                            {userRole === 'teacher' && (
                                <>
                                    <CardHeader>
                                        <CardTitle>Assignments to Review</CardTitle>
                                        <CardDescription>Student submissions pending your feedback</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {pendingReviews && pendingReviews.length > 0 ? (
                                                pendingReviews.map((submission) => (
                                                    <div key={submission.id} className="flex items-start gap-4 rounded-lg border p-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium">{submission.title}</h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                {submission.course.title}
                                                            </p>
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('teacher.homework.review', submission.id)}>Review</Link>
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                                    <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                                                    <h3 className="text-lg font-medium">No pending reviews</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        You're all caught up with student submissions
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={route('teacher.homework.pending')}>View All Pending Reviews</Link>
                                        </Button>
                                    </CardFooter>
                                </>
                            )}

                            {userRole === 'admin' && (
                                <>
                                    <CardHeader>
                                        <CardTitle>System Status</CardTitle>
                                        <CardDescription>Platform health and key metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">User Growth</h4>
                                                    <span className="text-xs text-green-500">+5% this month</span>
                                                </div>
                                                <Progress value={65} className="h-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">Course Completion</h4>
                                                    <span className="text-xs text-amber-500">+2% this month</span>
                                                </div>
                                                <Progress value={stats.completionRate} className="h-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">System Load</h4>
                                                    <span className="text-xs text-green-500">Normal</span>
                                                </div>
                                                <Progress value={25} className="h-2" />
                                            </div>
                                            <div className="mt-6 flex items-start gap-4 rounded-lg border p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">All Systems Operational</h4>
                                                    <p className="text-xs text-muted-foreground">Last checked: Today at 9:30 AM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={route('admin.settings')}>System Settings</Link>
                                        </Button>
                                    </CardFooter>
                                </>
                            )}
                        </Card>
                    </section>

                    {/* Course Progress or Management */}
                    <section>
                        {userRole === 'student' && (
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle>Your Courses</CardTitle>
                                    <CardDescription>Track your progress across enrolled courses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {enrolledCourses.length > 0 ? (
                                        <div className="space-y-4">
                                            {enrolledCourses.map((course) => (
                                                <div key={course.id} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium">{course.title}</h4>
                                                            <p className="text-xs text-muted-foreground">Instructor: {course.teacher.name}</p>
                                                        </div>
                                                        <Badge 
                                                            variant="secondary" 
                                                            className="bg-opacity-15 text-xs font-normal"
                                                        >
                                                            {course.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                                                <div 
                                                                    className={`h-2 rounded-full ${getStatusColor(course.status)}`} 
                                                                    style={{ width: `${course.completion_percentage || 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <span className="w-12 text-right text-sm font-medium">{course.completion_percentage || 0}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">You are not enrolled in any courses</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Browse available courses to get started
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={route('student.courses.index')}>View All Courses</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {userRole === 'teacher' && (
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle>Your Courses</CardTitle>
                                    <CardDescription>Manage and track your teaching courses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {teacherCourses.length > 0 ? (
                                        <div className="space-y-4">
                                            {teacherCourses.map((course) => (
                                                <div key={course.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium">{course.title}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {course.students_count || 0} students • {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge 
                                                            variant="secondary" 
                                                            className="bg-opacity-15 text-xs font-normal"
                                                        >
                                                            {course.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('teacher.courses.show', course.id)}>Manage</Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">No courses assigned</h3>
                                            <p className="text-sm text-muted-foreground">
                                                You don't have any courses assigned to you yet
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={route('teacher.courses.index')}>View All Courses</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {userRole === 'admin' && (
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle>Platform Overview</CardTitle>
                                    <CardDescription>High-level metrics and system status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{stats.totalCourses}</h3>
                                            <p className="text-sm text-muted-foreground">Courses</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                                            <p className="text-sm text-muted-foreground">Users</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                                <UserCheck className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{stats.totalEnrollments}</h3>
                                            <p className="text-sm text-muted-foreground">Enrollments</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{stats.completionRate}%</h3>
                                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between gap-4">
                                    <Button variant="outline" className="flex-1" asChild>
                                        <Link href={route('admin.courses.index')}>Manage Courses</Link>
                                    </Button>
                                    <Button variant="outline" className="flex-1" asChild>
                                        <Link href={route('admin.users.index')}>Manage Users</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </section>
                </div>
            </SafeRender>
        </AppLayout>
    );
}
