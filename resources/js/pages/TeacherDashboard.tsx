import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    BookOpen, 
    Users, 
    CheckCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';

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
    student_count: number;
    completion_rate: number;
    start_date: string;
    end_date: string;
}

interface PendingReview {
    id: number;
    title: string;
    student: {
        id: number;
        name: string;
        avatar?: string;
    };
    course: {
        id: number;
        title: string;
    };
    submitted_at: string;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    created_at: string;
}

interface TeacherDashboardProps {
    teacherCourses: Course[];
    pendingReviews: PendingReview[];
    recentActivity: Activity[];
    stats: {
        totalStudents: number;
        totalCourses: number;
        completionRate: number;
        pendingReviews: number;
    };
}

export default function TeacherDashboard({
    teacherCourses = [],
    pendingReviews = [],
    recentActivity = [],
    stats = {
        totalStudents: 0,
        totalCourses: 0,
        completionRate: 0,
        pendingReviews: 0
    }
}: TeacherDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    
    // Helper functions
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };
    
    const getStatusBadge = (status: string) => {
        if (!status) return <Badge variant="outline">Unknown</Badge>;
        
        const statusMap = {
            'active': <Badge variant="success">Active</Badge>,
            'upcoming': <Badge variant="info">Upcoming</Badge>,
            'completed': <Badge variant="secondary">Completed</Badge>,
            'cancelled': <Badge variant="destructive">Cancelled</Badge>
        };
        
        return statusMap[status.toLowerCase()] || <Badge variant="outline">{status}</Badge>;
    };
    
    // Sort reviews by submission date (most recent first)
    const sortedReviews = [...pendingReviews].sort((a, b) => 
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />
            
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    {/* Key Metrics Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Total Students Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Across {stats.totalCourses} courses
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Courses Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {teacherCourses.filter(c => c.status === 'active').length} active courses
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Completion Rate Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Overall homework completion
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Pending Reviews Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Submissions awaiting review
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Content Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Courses List */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>My Courses</CardTitle>
                                <Link href="/teacher/courses">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teacherCourses.slice(0, 5).map((course) => (
                                        <div key={course.id} className="flex flex-col space-y-2 p-3 rounded-lg border">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{course.title}</div>
                                                {getStatusBadge(course.status)}
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <div>{course.student_count} students</div>
                                                <div>{course.completion_rate}% completed</div>
                                            </div>
                                        </div>
                                    ))}
                                    {teacherCourses.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4">
                                            No courses found
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Pending Reviews */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>Pending Reviews</CardTitle>
                                <Link href="/teacher/reviews">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {sortedReviews.slice(0, 4).map((review) => (
                                        <Link key={review.id} href={`/teacher/reviews/${review.id}`}>
                                            <div className="flex flex-col space-y-2 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                                <div className="font-medium">{review.title}</div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="text-muted-foreground">{review.student.name}</div>
                                                    <div className="text-muted-foreground">{formatDate(review.submitted_at)}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {sortedReviews.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4">
                                            No pending reviews
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href="/teacher/courses/create">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <BookOpen className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">New Course</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/teacher/assignments/create">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Clock className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">New Assignment</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/teacher/reviews">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <CheckCircle className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Review Homework</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/teacher/students">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Users className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">View Students</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 