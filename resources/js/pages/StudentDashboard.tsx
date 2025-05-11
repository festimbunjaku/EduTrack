import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    BookOpen, 
    GraduationCap, 
    Calendar, 
    Clock, 
    FileText, 
    CheckCircle,
    ClockCountdown,
    TrendingUp,
    User,
    Bell,
    ExternalLink,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    completion_percentage: number;
    teacher: {
        id: number;
        name: string;
    };
    start_date: string;
    end_date: string;
}

interface Homework {
    id: number;
    title: string;
    description: string;
    due_date: string;
    status: string;
    course: {
        id: number;
        title: string;
    };
}

interface Activity {
    id: string;
    type: string;
    description: string;
    created_at: string;
}

interface StudentDashboardProps {
    enrolledCourses: Course[];
    pendingHomework: Homework[];
    recentActivity: Activity[];
    stats: {
        enrolledCourses: number;
        activeCourses: number;
        completedHomework: number;
        pendingHomework: number;
    };
}

export default function StudentDashboard({
    enrolledCourses = [],
    pendingHomework = [],
    recentActivity = [],
    stats = {
        enrolledCourses: 0,
        activeCourses: 0,
        completedHomework: 0,
        pendingHomework: 0
    }
}: StudentDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('overview');
    
    // Helper functions
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const getRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHours = Math.round(diffMin / 60);
        const diffDays = Math.round(diffHours / 24);
        
        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        
        return formatDate(dateString);
    };
    
    const getDueStatus = (dueDate: string) => {
        if (!dueDate) return '';
        
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return <Badge variant="destructive">Overdue</Badge>;
        if (diffDays === 0) return <Badge variant="warning">Due Today</Badge>;
        if (diffDays <= 2) return <Badge variant="warning">{diffDays}d left</Badge>;
        return <Badge variant="outline">{diffDays}d left</Badge>;
    };
    
    const getStatusColor = (status: string) => {
        if (!status) return 'bg-gray-500';
        
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-500';
            case 'upcoming': return 'bg-blue-500';
            case 'completed': return 'bg-purple-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    
    // Progress calculation
    const totalProgress = stats.enrolledCourses > 0 
        ? Math.round((enrolledCourses.reduce((sum, course) => sum + course.completion_percentage, 0)) / stats.enrolledCourses)
        : 0;
    
    // Sort courses by status - active first, then upcoming, then completed
    const sortedCourses = [...enrolledCourses].sort((a, b) => {
        const order = { 'active': 0, 'upcoming': 1, 'completed': 2 };
        return (order[a.status.toLowerCase()] || 3) - (order[b.status.toLowerCase()] || 3);
    });
    
    // Sort homework by due date (closest first)
    const sortedHomework = [...pendingHomework].sort((a, b) => {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    {/* Key Metrics Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Enrolled Courses Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.activeCourses} active courses
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Overall Progress Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {enrolledCourses.length > 0
                                        ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.completion_percentage, 0) / enrolledCourses.length)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Average completion across courses
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Completed Homework Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completedHomework}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Assignments completed successfully
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Pending Homework Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingHomework}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Assignments awaiting submission
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Content Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Pending Homework List */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>Pending Homework</CardTitle>
                                <Link href="/student/homework">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {sortedHomework.slice(0, 5).map((homework) => (
                                        <Link key={homework.id} href={`/student/homework/${homework.id}`}>
                                            <div className="flex flex-col space-y-2 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">{homework.title}</div>
                                                    {getDueStatus(homework.due_date)}
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="text-muted-foreground">{homework.course.title}</div>
                                                    <div className="text-muted-foreground">Due: {formatDate(homework.due_date)}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {sortedHomework.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4">
                                            No pending homework
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Active Courses */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>My Courses</CardTitle>
                                <Link href="/student/courses">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {enrolledCourses
                                        .filter(course => course.status === 'active')
                                        .slice(0, 4)
                                        .map((course) => (
                                            <Link key={course.id} href={`/student/courses/${course.id}`}>
                                                <div className="flex flex-col space-y-2 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                                    <div className="font-medium">{course.title}</div>
                                                    <div className="flex justify-between text-sm">
                                                        <div className="text-muted-foreground">
                                                            Prof. {course.teacher.name.split(' ')[0]}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {course.completion_percentage}% completed
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    {enrolledCourses.filter(course => course.status === 'active').length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4">
                                            No active courses
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href="/student/courses/browse">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <BookOpen className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Browse Courses</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/student/homework">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Clock className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">All Assignments</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/student/submissions">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <CheckCircle className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">My Submissions</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/student/progress">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <GraduationCap className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Academic Progress</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 