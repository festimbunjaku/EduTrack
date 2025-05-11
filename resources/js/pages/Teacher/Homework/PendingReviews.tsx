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
  UserIcon,
  FileTextIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Submission {
  id: number;
  content: string;
  attachment: string | null;
  submitted_at: string;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  homework: {
    id: number;
    title: string;
    course: {
      id: number;
      title: string;
    };
  };
}

interface CourseGroup {
  course: {
    id: number;
    title: string;
  };
  submissions: Submission[];
  count: number;
}

interface PendingReviewsProps extends PageProps {
  courseGroups: CourseGroup[];
  totalPending: number;
}

export default function PendingReviews({ auth, courseGroups, totalPending }: PendingReviewsProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Pending Homework Submissions" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Pending Homework Submissions</h1>
            <p className="text-gray-600">
              You have {totalPending} submissions waiting to be reviewed.
            </p>
          </div>

          {totalPending > 0 ? (
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Submissions ({totalPending})</TabsTrigger>
                  {courseGroups.map((group) => (
                    <TabsTrigger key={group.course.id} value={`course-${group.course.id}`}>
                      {group.course.title} ({group.count})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="all">
                <div className="space-y-6">
                  {courseGroups.map((group) => (
                    <Card key={group.course.id}>
                      <CardHeader>
                        <CardTitle>
                          <Link href={route('teacher.courses.show', group.course.id)}>
                            {group.course.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {group.count} pending submissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y">
                          {group.submissions.map((submission) => (
                            <div key={submission.id} className="py-4 flex items-start">
                              <div className="flex-shrink-0 mr-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-amber-600" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <h3 className="text-base font-medium">
                                    {submission.homework.title}
                                  </h3>
                                  <Badge className="ml-2 bg-amber-100 text-amber-800">Pending</Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  Submitted by <span className="font-medium">{submission.user.name}</span> on {formatDate(submission.submitted_at)}
                                </p>
                                <div className="flex space-x-2">
                                  <Link 
                                    href={route('teacher.courses.homework.show', [group.course.id, submission.homework.id])}
                                  >
                                    <Button size="sm" variant="outline">
                                      <ClipboardListIcon className="h-4 w-4 mr-2" />
                                      Review Submission
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {courseGroups.map((group) => (
                <TabsContent key={group.course.id} value={`course-${group.course.id}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Link href={route('teacher.courses.show', group.course.id)}>
                          {group.course.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {group.count} pending submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {group.submissions.map((submission) => (
                          <div key={submission.id} className="py-4 flex items-start">
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-amber-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <h3 className="text-base font-medium">
                                  {submission.homework.title}
                                </h3>
                                <Badge className="ml-2 bg-amber-100 text-amber-800">Pending</Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">
                                Submitted by <span className="font-medium">{submission.user.name}</span> on {formatDate(submission.submitted_at)}
                              </p>
                              <div className="flex space-x-2">
                                <Link 
                                  href={route('teacher.courses.homework.show', [group.course.id, submission.homework.id])}
                                >
                                  <Button size="sm" variant="outline">
                                    <ClipboardListIcon className="h-4 w-4 mr-2" />
                                    Review Submission
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">All Caught Up!</h2>
                <p className="text-gray-500 mb-6">
                  You've reviewed all submitted homework. Check back later for new submissions.
                </p>
                <Link href={route('teacher.courses.index')}>
                  <Button>
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    View My Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 