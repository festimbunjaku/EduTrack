import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Filter, BookOpen, Users, Clock, DollarSign, X, CircleUserRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    teacher: {
        name: string;
    };
    enrolled_students_count: number;
    max_enrollment: number;
    duration: string;
    features: string[];
}

interface Props {
    courses: Course[];
    filters: {
        search: string;
        price: string;
    };
}

export default function Discover({ courses: initialCourses, filters: initialFilters }: Props) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        price: initialFilters?.price || 'all',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState<number | null>(null);

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        
        const params: Record<string, string> = {};
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (value && value !== 'all') params[key] = value;
        });

        setIsLoading(true);
        router.get(route('student.courses.discover'), params, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setIsLoading(false),
            onError: () => setIsLoading(false),
        });
    };

    const clearFilters = () => {
        updateFilters({
            search: '',
            price: 'all',
        });
    };

    const requestEnrollment = (courseId: number) => {
        setIsEnrolling(courseId);
        router.post(route('student.courses.request-enrollment', courseId), {}, {
            onSuccess: () => setIsEnrolling(null),
            onError: () => setIsEnrolling(null),
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Courses', href: route('student.courses.discover') },
        { title: 'Discover', href: route('student.courses.discover') },
    ];

    const hasActiveFilters = filters.search || filters.price !== 'all';

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Discover Courses"
                    description="Browse and enroll in available courses"
                />

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Search and Filters */}
                    <div className="lg:w-72 shrink-0 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Search
                                    </div>
                                    {filters.search && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => updateFilters({ search: '' })}
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="Search courses..."
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    className="w-full"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Filters
                                    </div>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-xs"
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price Range</Label>
                                    <Select
                                        value={filters.price}
                                        onValueChange={(value) => updateFilters({ price: value })}
                                    >
                                        <SelectTrigger id="price">
                                            <SelectValue placeholder="Select price range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Prices</SelectItem>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="under_50">Under $50</SelectItem>
                                            <SelectItem value="50_100">$50 - $100</SelectItem>
                                            <SelectItem value="over_100">Over $100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Courses Grid */}
                    <div className="flex-1 space-y-6">
                        {isLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="animate-pulse">
                                        <CardHeader className="space-y-2">
                                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                                            <div className="h-3 w-1/2 bg-muted rounded"></div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-20 bg-muted rounded"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                    <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No Courses Found</h3>
                                    <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
                                    {hasActiveFilters && (
                                        <Button 
                                            variant="outline" 
                                            onClick={clearFilters}
                                            className="mt-4"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {courses.map((course) => (
                                    <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                                        {course.title}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-1">
                                                        by {course.teacher.name}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {course.description}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-primary" />
                                                    <span>{course.enrolled_students_count} students</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <span>{course.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">
                                                        {course.price === 0 ? 'Free' : `$${course.price}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CircleUserRound className="h-4 w-4 text-primary" />
                                                    <span>
                                                        {Math.max(0, course.max_enrollment - course.enrolled_students_count)} spots left
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button 
                                                variant="outline"
                                                className="flex-1" 
                                                onClick={() => router.visit(route('student.courses.discover.show', course.id))}
                                            >
                                                View Details
                                            </Button>
                                            <Button 
                                                className="flex-1"
                                                onClick={() => requestEnrollment(course.id)}
                                                disabled={isEnrolling === course.id}
                                            >
                                                Enroll Now
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
} 