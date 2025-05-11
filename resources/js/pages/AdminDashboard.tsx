import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    Users, 
    BookOpen, 
    FileText, 
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface UserStats {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    activeThisMonth: number;
    growthRate: number;
}

interface CourseStats {
    total: number;
    active: number;
    completed: number;
    averageEnrollment: number;
    completionRate: number;
}

interface SystemStats {
    homeworkCompletionRate: number;
    averageTeacherResponseTime: number;
    systemHealth: number;
    activeUsers: number;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        role: string;
    };
}

interface AdminDashboardProps {
    userStats: UserStats;
    courseStats: CourseStats;
    systemStats: SystemStats;
    recentActivity: Activity[];
}

export default function AdminDashboard({
    userStats = {
        total: 0,
        students: 0,
        teachers: 0,
        admins: 0,
        activeThisMonth: 0,
        growthRate: 0
    },
    courseStats = {
        total: 0,
        active: 0,
        completed: 0,
        averageEnrollment: 0,
        completionRate: 0
    },
    systemStats = {
        homeworkCompletionRate: 0,
        averageTeacherResponseTime: 0,
        systemHealth: 100,
        activeUsers: 0
    },
    recentActivity = []
}: AdminDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    
    // Helper functions
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Get activity icon by type
    const getActivityIcon = (type: string) => {
        switch(type) {
            case 'user': return <Users className="h-4 w-4" />;
            case 'course': return <BookOpen className="h-4 w-4" />;
            case 'homework': return <FileText className="h-4 w-4" />;
            default: return <BarChart3 className="h-4 w-4" />;
        }
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    {/* Key Metrics Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Users Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.total}</div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-col gap-1">
                                            <div>Students: {userStats.students}</div>
                                            <div>Teachers: {userStats.teachers}</div>
                                            <div>Admins: {userStats.admins}</div>
                                        </div>
                                    </div>
                                    <Badge variant={userStats.growthRate >= 0 ? "success" : "destructive"} className="h-5">
                                        {userStats.growthRate >= 0 ? '+' : ''}{userStats.growthRate}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Courses Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{courseStats.total}</div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-col gap-1">
                                            <div>Active: {courseStats.active}</div>
                                            <div>Completed: {courseStats.completed}</div>
                                            <div>Avg. Enrollment: {courseStats.averageEnrollment}</div>
                                        </div>
                                    </div>
                                    <Badge variant={courseStats.completionRate >= 70 ? "success" : "warning"} className="h-5">
                                        {courseStats.completionRate}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* System Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">System</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.activeUsers} users active</div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-col gap-1">
                                            <div>Homework completion: {systemStats.homeworkCompletionRate}%</div>
                                            <div>Avg. response time: {systemStats.averageTeacherResponseTime.toFixed(1)} days</div>
                                            <div>System health: {systemStats.systemHealth}%</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Recent Activity</CardTitle>
                            <Link href="/admin/activity">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    View All <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 text-sm">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/users">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Users className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Manage Users</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/admin/courses">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <BookOpen className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Manage Courses</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/admin/reports">
                            <Card className="hover:bg-muted/30 transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <BarChart3 className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">View Reports</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 