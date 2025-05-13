import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CalendarIcon, 
  UserIcon, 
  BookIcon, 
  FileIcon, 
  AwardIcon, 
  ClockIcon, 
  CheckIcon, 
  XIcon,
  BookOpen,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  CircleUserRound
} from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  file_path?: string;
  url?: string;
  created_at: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  attachment?: string;
  created_at: string;
  student_submission?: {
    id: number;
    content: string;
    attachment?: string;
    submitted_at: string;
    graded_at?: string;
    grade?: number;
    feedback?: string;
  };
}

interface Certificate {
  id: number;
  certificate_number: string;
  achievement: string;
  issued_at: string;
  completion_date: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  teacher: Teacher;
  materials: Material[];
  homeworks: Homework[];
  schedule: Record<string, string>;
}

interface ShowProps extends PageProps {
  course: Course;
  homeworks: Homework[];
  certificate?: Certificate;
}

export default function Show({ auth, course, homeworks, certificate }: ShowProps) {
  console.log('Course in Show page:', course);

  const breadcrumbs = [
    { title: 'Courses', href: route('student.courses.index') },
    { title: 'My Courses', href: route('student.courses.index') },
    { title: course?.title || 'Course Details', href: route('student.courses.show', course?.id) },
  ];

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Parse schedule data
  const getScheduleData = () => {
    if (!course.schedule) return {};
    
    if (typeof course.schedule === 'string') {
      try {
        return JSON.parse(course.schedule);
      } catch (e) {
        console.error('Error parsing schedule:', e);
        return {};
      }
    }
    
    return course.schedule;
  };
  
  const scheduleData = getScheduleData();

  // Format schedule time object to string
  const formatScheduleTime = (timeValue: any): string => {
    if (!timeValue) return 'N/A';
    
    // If it's already a string, return it
    if (typeof timeValue === 'string') return timeValue;
    
    // If it's an object with start_time and end_time
    if (typeof timeValue === 'object' && timeValue.start_time && timeValue.end_time) {
      return `${timeValue.start_time} - ${timeValue.end_time}`;
    }
    
    // If it's some other object, stringify it safely
    return JSON.stringify(timeValue);
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get material type icon
  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <BookIcon className="h-5 w-5 text-purple-500" />;
      case 'link':
        return <FileIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Check if homework is past due date
  const isPastDueDate = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  // Check if homework is submitted
  const isSubmitted = (homework: Homework) => {
    return !!homework.student_submission;
  };

  // Check if homework is graded
  const isGraded = (homework: Homework) => {
    return homework.student_submission?.graded_at !== undefined;
  };

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <Head title={course.title} />

      <div className="space-y-6 p-6">
        <PageHeader
          title={course.title}
          description={`Course by ${course.teacher.name}`}
        />

        {/* Course Status Banner */}
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {course.status === 'active' ? 'You are enrolled in this course' :
                   course.status === 'completed' ? 'Course completed' :
                   course.status === 'upcoming' ? 'Course starts soon' :
                   'Course cancelled'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {course.status === 'active' ? 'Access your course materials and continue learning' :
                   course.status === 'completed' ? 'View your certificate and completed materials' :
                   course.status === 'upcoming' ? `Starting on ${formatDate(course.start_date)}` :
                   'This course has been cancelled'}
                </p>
              </div>
            </div>
            <Badge className={getStatusBadgeColor(course.status)}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Course Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">Course Period</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(course.start_date)} - {formatDate(course.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">Learning Resources</span>
                      <p className="text-sm text-muted-foreground">
                        {course.materials.length} materials available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">Assignments</span>
                      <p className="text-sm text-muted-foreground">
                        {homeworks.length} total assignments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">Your Progress</span>
                      <p className="text-sm text-muted-foreground">
                        {homeworks.filter(hw => isSubmitted(hw)).length}/{homeworks.length} completed
                      </p>
                    </div>
                  </div>
                </div>

                {certificate && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AwardIcon className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h4 className="font-medium">Course Completed!</h4>
                          <p className="text-sm text-muted-foreground">Certificate issued on {formatDate(certificate.issued_at)}</p>
                        </div>
                      </div>
                      <Link href={route('student.certificates.show', certificate.id)}>
                        <Button variant="outline">
                          View Certificate
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Schedule Card for Main Content */}
            {Object.keys(scheduleData).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Class Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(scheduleData).map(([day, time]) => (
                      <div 
                        key={day}
                        className="flex items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <ClockIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{day}</p>
                          <p className="text-sm text-muted-foreground">{formatScheduleTime(time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="materials" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="homework">Homework</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="materials">
                    {course.materials.length === 0 ? (
                      <div className="text-center py-6">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium">No Materials Yet</h3>
                        <p className="text-sm text-muted-foreground">Course materials will be added soon.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {course.materials.map((material) => (
                          <div key={material.id} className="py-4 flex items-start">
                            <div className="mr-4">
                              <div className="rounded-full p-2 bg-primary/10">
                                {getMaterialTypeIcon(material.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{material.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{material.description}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>Added {formatDate(material.created_at)}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Link href={route('student.courses.materials.show', [course.id, material.id])}>
                                <Button variant="outline" size="sm">View Material</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="homework">
                    {homeworks.length === 0 ? (
                      <div className="text-center py-6">
                        <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium">No Homework Yet</h3>
                        <p className="text-sm text-muted-foreground">Assignments will be added as the course progresses.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {homeworks.map((homework) => (
                          <div key={homework.id} className="py-4">
                            <div className="flex items-start">
                              <div className="mr-4">
                                <div className={`rounded-full p-2 ${
                                  isSubmitted(homework) ? 'bg-green-100' : 
                                  isPastDueDate(homework.due_date) ? 'bg-red-100' : 
                                  'bg-primary/10'
                                }`}>
                                  <FileIcon className={`h-5 w-5 ${
                                    isSubmitted(homework) ? 'text-green-600' :
                                    isPastDueDate(homework.due_date) ? 'text-red-600' :
                                    'text-primary'
                                  }`} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium truncate">{homework.title}</h3>
                                  {isGraded(homework) && homework.student_submission?.grade !== undefined && (
                                    <Badge variant="outline" className="ml-2">
                                      Grade: {homework.student_submission.grade}%
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{homework.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>Due {formatDate(homework.due_date)}</span>
                                  </div>
                                  {isSubmitted(homework) && (
                                    <div className="flex items-center text-green-600">
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                      <span>Submitted</span>
                                    </div>
                                  )}
                                  {isPastDueDate(homework.due_date) && !isSubmitted(homework) && (
                                    <div className="flex items-center text-red-600">
                                      <XIcon className="h-3 w-3 mr-1" />
                                      <span>Overdue</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <Link href={route('student.courses.homework.show', [course.id, homework.id])}>
                                  <Button 
                                    variant={isSubmitted(homework) ? "outline" : "default"}
                                    size="sm"
                                  >
                                    {isSubmitted(homework) ? 'View Submission' : 'Submit'}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            {homework.student_submission?.feedback && (
                              <div className="mt-3 ml-12 p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium">Feedback:</p>
                                <p className="text-sm text-muted-foreground">{homework.student_submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="description">
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{course.teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{course.teacher.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Materials</p>
                    <p className="text-2xl font-semibold">{course.materials.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Assignments</p>
                    <p className="text-2xl font-semibold">{homeworks.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold">{homeworks.filter(hw => isSubmitted(hw)).length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold">{homeworks.filter(hw => !isSubmitted(hw)).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Start Date</span>
                  <span className="text-sm">{formatDate(course.start_date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">End Date</span>
                  <span className="text-sm">{formatDate(course.end_date)}</span>
                </div>
                {certificate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm">{formatDate(certificate.completion_date)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Class Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(scheduleData).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(scheduleData).map(([day, time]) => (
                      <div 
                        key={day}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <ClockIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{day}</p>
                          <p className="text-xs text-muted-foreground">{formatScheduleTime(time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ClockIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium">No Schedule Available</h3>
                    <p className="text-xs text-muted-foreground mt-1">The schedule for this course has not been set.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 