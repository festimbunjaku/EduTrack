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
  ChevronRightIcon,
  ClipboardListIcon,
  ClockIcon,
  FolderIcon,
  GraduationCapIcon,
  MoreHorizontalIcon,
  PlusIcon,
  UsersIcon,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: number;
  title: string;
  status: string;
  thumbnail_url: string | null;
  students_count: number;
  materials_count: number;
  homework_count: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  courses_count: number;
  pending_homeworks_count: number;
}

interface Activity {
  id: number;
  type: 'student_enrolled' | 'homework_submitted' | 'course_published' | 'material_added';
  title: string;
  date: string;
  course?: {
    id: number;
    title: string;
  };
  student?: {
    id: number;
    name: string;
  };
}

interface Statistic {
  totalCourses: number;
  totalStudents: number;
  pendingReviews: number;
}

interface DashboardProps extends PageProps {
  courses: Course[];
  pendingHomework: any[];
  stats: Statistic;
}

export default function Dashboard({
  auth,
  courses,
  pendingHomework,
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
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_enrolled':
        return <UsersIcon className="h-5 w-5 text-blue-500" />;
      case 'homework_submitted':
        return <ClipboardListIcon className="h-5 w-5 text-orange-500" />;
      case 'course_published':
        return <BookOpenIcon className="h-5 w-5 text-green-500" />;
      case 'material_added':
        return <FolderIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Teacher Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {auth.user.name}!</h1>
            <p className="text-gray-600">Here's an overview of your teaching dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-4">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold">{stats.totalCourses}</p>
                      <p className="text-sm text-gray-500 ml-2">active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-4">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
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
                    <p className="text-sm text-gray-500">Homework Submissions</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                      <p className="text-sm text-gray-500 ml-2">pending</p>
                    </div>
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
                    <div className="flex space-x-2">
                      <Link href={route('teacher.courses.create')}>
                        <Button size="sm">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          New Course
                        </Button>
                      </Link>
                      <Link href={route('teacher.courses.index')}>
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {courses.length > 0 ? (
                    <div className="divide-y">
                      {courses.map((course) => (
                        <div key={course.id} className="p-4 flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            {course.thumbnail_url ? (
                              <img 
                                src={course.thumbnail_url} 
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
                              <Link href={route('teacher.courses.show', course.id)}>
                                <h3 className="text-base font-medium text-blue-600 hover:text-blue-800 truncate">
                                  {course.title}
                                </h3>
                              </Link>
                              <Badge className={`ml-2 ${getStatusBadgeColor(course.status)}`}>
                                {course.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="text-center px-2 py-1 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Students</p>
                                <p className="font-medium">{course.students_count}</p>
                              </div>
                              <div className="text-center px-2 py-1 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Materials</p>
                                <p className="font-medium">{course.materials_count}</p>
                              </div>
                              <div className="text-center px-2 py-1 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Homework</p>
                                <p className="font-medium">{course.homework_count}</p>
                              </div>
                            </div>
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
                                  <Link href={route('teacher.courses.show', course.id)}>
                                    View Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={route('teacher.courses.edit', course.id)}>
                                    Edit Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Link href={route('teacher.courses.materials.create', course.id)}>
                                    Add Material
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={route('teacher.courses.homework.create', course.id)}>
                                    Add Homework
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
                      <Link href={route('teacher.courses.create')}>
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Your First Course
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Activities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingHomework && pendingHomework.length > 0 ? (
                    <div className="divide-y">
                      {pendingHomework.map((submission) => (
                        <div key={submission.id} className="p-4 flex items-start">
                          <div className="p-2 rounded-full bg-gray-100 mr-3 flex-shrink-0">
                            <ClipboardListIcon className="h-5 w-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{submission.homework.title}</p>
                            <div className="flex text-xs text-gray-500">
                              {submission.homework.course && (
                                <p>
                                  <span>Course: </span>
                                  <Link 
                                    href={route('teacher.courses.show', submission.homework.course.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {submission.homework.course.title}
                                  </Link>
                                </p>
                              )}
                              {submission.user && (
                                <p className="ml-2">
                                  <span>Student: </span>
                                  <span>{submission.user.name}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatRelativeTime(submission.submitted_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No pending submissions to display.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Students</CardTitle>
                  <CardDescription>Students enrolled in your courses</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {courses.length > 0 ? (
                    <div className="divide-y">
                      {courses.map((course) => (
                        <div key={course.id} className="p-4 flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {course.thumbnail_url ? (
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <BookOpenIcon className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{course.title}</p>
                            <p className="text-sm text-gray-500 truncate">{course.status}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-500">Students: {course.students_count}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No students have enrolled in your courses yet.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 px-4 py-3">
                  <Link href={route('teacher.students.index')} className="w-full">
                    <Button variant="outline" className="w-full" size="sm">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      View All Students
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                  <CardDescription>Homework submission status</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.pendingReviews > 0 ? (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm">
                      <div className="font-medium flex items-center text-yellow-800 mb-1">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Pending Submissions
                      </div>
                      <p className="text-yellow-700">
                        You have {stats.pendingReviews} submissions waiting to be graded.
                      </p>
                      <Link 
                        href={route('teacher.homework.pending')}
                        className="mt-2 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
                      >
                        Grade submissions
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm">
                      <div className="font-medium flex items-center text-green-800 mb-1">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        All Caught Up
                      </div>
                      <p className="text-green-700">
                        You've graded all current homework submissions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 divide-y">
                    <Link 
                      href={route('teacher.courses.create')}
                      className="p-3 flex items-center hover:bg-gray-50"
                    >
                      <div className="p-2 rounded-full bg-blue-100 mr-3">
                        <BookOpenIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Create New Course</span>
                      <ChevronRightIcon className="h-4 w-4 ml-auto" />
                    </Link>
                    <Link 
                      href={route('teacher.certificates.create')}
                      className="p-3 flex items-center hover:bg-gray-50"
                    >
                      <div className="p-2 rounded-full bg-green-100 mr-3">
                        <GraduationCapIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Create Certificate</span>
                      <ChevronRightIcon className="h-4 w-4 ml-auto" />
                    </Link>
                    <Link 
                      href={route('teacher.homework.pending')}
                      className="p-3 flex items-center hover:bg-gray-50"
                    >
                      <div className="p-2 rounded-full bg-amber-100 mr-3">
                        <ClipboardListIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <span>Review Homework</span>
                      <ChevronRightIcon className="h-4 w-4 ml-auto" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 