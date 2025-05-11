import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  ClockIcon,
  FolderIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Course {
  id: number;
  title: string;
  description: string;
  status?: string;
  progress?: number;
  unread_materials?: number;
  image?: string | null;
  teacher?: {
    name: string;
  };
}

interface Homework {
  id: number;
  title: string;
  due_date: string;
  is_submitted?: boolean;
  course: {
    id: number;
    title: string;
  };
}

interface Submission {
  id: number;
  submitted_at: string;
  status: string;
  grade?: number;
  homework: {
    id: number;
    title: string;
    course: {
      id: number;
      title: string;
    }
  };
}

interface DashboardProps extends PageProps {
  enrolledCourses: Course[];
  upcomingHomework: Homework[];
  recentSubmissions: Submission[];
  stats: {
    enrolledCourses: number;
    completedHomework: number;
    pendingHomework: number;
  };
}

export default function Dashboard({
  auth,
  enrolledCourses,
  upcomingHomework,
  recentSubmissions,
  stats,
}: DashboardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'material_added':
        return <FolderIcon className="h-5 w-5 text-blue-500" />;
      case 'homework_assigned':
        return <ClipboardListIcon className="h-5 w-5 text-orange-500" />;
      case 'homework_graded':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'course_enrolled':
        return <BookOpenIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FolderIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Student Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {auth.user.name}!</h1>
            <p className="text-gray-600">Here's an overview of your learning progress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-4">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Courses</p>
                    <p className="text-2xl font-bold">{stats.enrolledCourses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Homework</p>
                    <p className="text-2xl font-bold">{stats.completedHomework}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100 mr-4">
                    <ClipboardListIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Homework</p>
                    <p className="text-2xl font-bold">{stats.pendingHomework}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Courses</CardTitle>
                    <Link href={route('student.courses.index')}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {enrolledCourses && enrolledCourses.length > 0 ? (
                    <div className="divide-y">
                      {enrolledCourses.map((course) => (
                        <div key={course.id} className="p-4 flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            {course.image ? (
                              <img 
                                src={course.image} 
                                alt={course.title} 
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                                <BookOpenIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <Link href={route('student.courses.show', course.id)}>
                                <h3 className="text-base font-medium text-blue-600 hover:text-blue-800 truncate">
                                  {course.title}
                                </h3>
                              </Link>
                              {course.status && (
                                <Badge className={`ml-2 ${getStatusBadgeColor(course.status)}`}>
                                  {course.status}
                                </Badge>
                              )}
                              {course.unread_materials && course.unread_materials > 0 && (
                                <Badge className="ml-2 bg-red-100 text-red-800">
                                  {course.unread_materials} new
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              Instructor: {course.teacher?.name || 'Unknown'}
                            </p>
                            {course.progress !== undefined && (
                              <>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                              </>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link href={route('student.courses.show', course.id)}>
                                    View Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                      <Link href={route('student.courses.discover')}>
                        <Button>Discover Courses</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Submissions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentSubmissions && recentSubmissions.length > 0 ? (
                    <div className="divide-y">
                      {recentSubmissions.map((submission) => (
                        <div key={submission.id} className="p-4 flex items-start">
                          <div className="p-2 rounded-full bg-gray-100 mr-3 flex-shrink-0">
                            <ClipboardListIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{submission.homework.title}</p>
                            <p className="text-xs text-gray-500">
                              <span>Course: </span>
                              <Link 
                                href={route('student.courses.show', submission.homework.course.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {submission.homework.course.title}
                              </Link>
                            </p>
                            {submission.status === 'graded' && (
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                Grade: {submission.grade}/100
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatRelativeTime(submission.submitted_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No recent submissions to display.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Homework</CardTitle>
                  <CardDescription>Assignments due soon</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingHomework && upcomingHomework.length > 0 ? (
                    <div className="divide-y">
                      {upcomingHomework.map((homework) => (
                        <div key={homework.id} className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <Link 
                              href={route('student.homework.show', [homework.course.id, homework.id])}
                              className="text-base font-medium text-blue-600 hover:text-blue-800"
                            >
                              {homework.title}
                            </Link>
                            {homework.is_submitted ? (
                              <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            <Link 
                              href={route('student.courses.show', homework.course.id)}
                              className="hover:text-blue-600"
                            >
                              {homework.course.title}
                            </Link>
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>Due {formatDate(homework.due_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No upcoming homework assignments.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 px-4 py-3">
                  <Link href={route('student.homework.index')} className="w-full">
                    <Button variant="outline" className="w-full" size="sm">
                      View All Homework
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Streak</CardTitle>
                  <CardDescription>Keep up the momentum!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center my-2">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-full bg-orange-100">
                          <ClockIcon className="h-8 w-8 text-orange-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold">7 Days</p>
                      <p className="text-sm text-gray-500">Current streak</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mt-4">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-8 rounded-sm ${idx < 5 ? 'bg-green-500' : 'bg-gray-200'}`}
                        title={`Day ${idx + 1}`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">Last 7 days</p>
                </CardContent>
                <CardFooter className="bg-gray-50 px-4 py-3 text-center">
                  <p className="text-sm text-gray-600">Study today to maintain your streak!</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 