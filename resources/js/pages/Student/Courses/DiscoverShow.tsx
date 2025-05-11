import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { router } from '@inertiajs/react';
import { BookOpen, Users, Clock, DollarSign, CheckCircle, AlertCircle, GraduationCap, CircleUserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
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
    schedule: string | Record<string, string> | any; // Could be any format
    prerequisites: string[];
    syllabus: {
        title: string;
        description: string;
    }[];
    is_enrolled: boolean;
    has_pending_request: boolean;
    schedule_debug?: {
        raw: any;
        type: string;
        isString: boolean;
        isArray: boolean;
    };
}

interface Props {
    course: Course;
}

export default function DiscoverShow({ course }: Props) {
    const [isRequesting, setIsRequesting] = useState(false);

    // Debug log to see what data we have
    console.log('Course object:', course);

    // Ensure arrays have default values
    const features = course?.features || [];
    const prerequisites = course?.prerequisites || [];
    const syllabus = course?.syllabus || [];

    // Parse and normalize schedule data
    let scheduleObject: Record<string, any> = {};
    if (course?.schedule) {
        if (course.schedule_debug) {
            console.log('Schedule debug:', course.schedule_debug);
        }

        try {
            if (typeof course.schedule === 'string') {
                // If it's a JSON string
                scheduleObject = JSON.parse(course.schedule);
            } else if (Array.isArray(course.schedule)) {
                // If it's an array of schedule items
                course.schedule.forEach((item: any, index: number) => {
                    if (item && typeof item === 'object' && item.day) {
                        // If it has a day property, use it as key
                        const day = item.day.charAt(0).toUpperCase() + item.day.slice(1);
                        scheduleObject[day] = item;
                    } else {
                        // Use index as fallback key
                        scheduleObject[`Time slot ${index + 1}`] = item;
                    }
                });
            } else if (typeof course.schedule === 'object') {
                // If it's already an object
                scheduleObject = course.schedule;
            }
        } catch (e) {
            console.error("Error parsing schedule:", e);
            // If we can't parse it, just show it as is
            if (typeof course.schedule === 'string') {
                scheduleObject = { 'Schedule': course.schedule };
            }
        }
    }

    const requestEnrollment = () => {
        setIsRequesting(true);
        router.post(route('student.courses.request-enrollment', course.id), {}, {
            onSuccess: () => setIsRequesting(false),
            onError: () => setIsRequesting(false),
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Courses', href: route('student.courses.discover') },
        { title: 'Discover', href: route('student.courses.discover') },
        { title: course?.title || 'Course Details', href: route('student.courses.discover.show', course?.id) },
    ];

    if (!course) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-6">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Course Not Found</h3>
                            <p className="text-sm text-muted-foreground">The requested course could not be found.</p>
                            <Button 
                                className="mt-4" 
                                onClick={() => router.visit(route('student.courses.discover'))}
                            >
                                Back to Courses
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-6">
                <PageHeader
                    title={course.title}
                    description={`Course by ${course.teacher?.name || 'Unknown Teacher'}`}
                />

                {/* Enrollment Status Banner */}
                <Card className="bg-muted/50">
                    <CardContent className="flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    {course.is_enrolled ? 'You are enrolled in this course' :
                                     course.has_pending_request ? 'Your enrollment request is pending' :
                                     'Ready to start learning?'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {course.is_enrolled ? 'Access your course materials and start learning' :
                                     course.has_pending_request ? 'We will notify you once your request is approved' :
                                     'Enroll now to get access to all course materials'}
                                </p>
                            </div>
                        </div>
                        {!course.is_enrolled && !course.has_pending_request && (
                            <Button
                                size="lg"
                                onClick={requestEnrollment}
                                disabled={isRequesting}
                            >
                                Enroll Now
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Course Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Course Overview
                                </CardTitle>
                                <CardDescription>What you'll learn in this course</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-muted-foreground">{course.description}</p>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{course.enrolled_students_count || 0} enrolled students</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <CircleUserRound className="h-4 w-4 text-primary" />
                                        <span className="font-medium">
                                            {Math.max(0, course.max_enrollment - (course.enrolled_students_count || 0))} spots available
                                        </span>
                                    </div>
                                </div>

                                {/* Add new schedule display if we have schedule data */}
                                {Object.keys(scheduleObject).length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-medium mb-3">Class Schedule</h4>
                                            <div className="grid gap-2 px-1 sm:grid-cols-2">
                                                {Object.entries(scheduleObject).map(([day, timeValue]) => (
                                                    <div 
                                                        key={day}
                                                        className="flex items-center p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div className="bg-primary/10 p-1.5 rounded-full">
                                                                <Clock className="h-3.5 w-3.5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-sm">{day}</span>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {typeof timeValue === 'object' && timeValue.start_time && timeValue.end_time 
                                                                        ? `${timeValue.start_time} - ${timeValue.end_time}`
                                                                        : String(timeValue)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {features.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3">Course Features</h4>
                                        <ul className="grid gap-2 sm:grid-cols-2">
                                            {features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Prerequisites */}
                        {prerequisites.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Prerequisites
                                    </CardTitle>
                                    <CardDescription>What you need to know before starting</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {prerequisites.map((prerequisite, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                                                <span>{prerequisite}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Syllabus */}
                        {syllabus.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Course Syllabus
                                    </CardTitle>
                                    <CardDescription>Detailed course content and structure</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {syllabus.map((item, index) => (
                                            <div key={index} className="space-y-2">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                                                        {index + 1}
                                                    </span>
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground pl-8">
                                                    {item.description}
                                                </p>
                                                {index < syllabus.length - 1 && <Separator className="mt-4" />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Course Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Instructor</span>
                                    <span className="text-sm">{course.teacher?.name || 'Unknown Teacher'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Enrollment</span>
                                    <span className="text-sm">{course.enrolled_students_count || 0} / {course.max_enrollment}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Price</span>
                                    <span className="text-sm font-medium">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                                </div>
                                
                                {/* Add Schedule Card */}
                                {Object.keys(scheduleObject).length > 0 && (
                                    <>
                                        <Separator className="my-3" />
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Schedule</h3>
                                            <div className="space-y-2 mt-2">
                                                {Object.entries(scheduleObject).map(([day, time]) => (
                                                    <div 
                                                        key={day}
                                                        className="flex items-center justify-between p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                                    >
                                                        <span className="font-medium text-sm">{day}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {typeof time === 'object' && time.start_time && time.end_time
                                                                    ? `${time.start_time} - ${time.end_time}`
                                                                    : String(time)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            {!course.is_enrolled && !course.has_pending_request && (
                                <CardFooter>
                                    <Button 
                                        className="w-full" 
                                        onClick={requestEnrollment}
                                        disabled={isRequesting}
                                    >
                                        Enroll Now
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
} 