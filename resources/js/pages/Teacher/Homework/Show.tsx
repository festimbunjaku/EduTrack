import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarIcon, 
  ArrowLeftIcon, 
  FileIcon, 
  DownloadIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  ClockIcon
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface HomeworkSubmission {
  id: number;
  user_id: number;
  user: User;
  content: string;
  attachment?: string;
  submitted_at: string;
  graded_at?: string;
  grade?: number;
  feedback?: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  attachment?: string;
  created_at: string;
  submissions: HomeworkSubmission[];
}

interface Course {
  id: number;
  title: string;
}

interface ShowProps extends PageProps {
  course: Course;
  homework: Homework;
}

export default function Show({ auth, course, homework }: ShowProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

  const { data, setData, errors, post, processing, reset } = useForm({
    grade: '',
    feedback: '',
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if homework is past due date
  const isPastDueDate = () => {
    return new Date() > new Date(homework.due_date);
  };

  // Open grade dialog for a submission
  const openGradeDialog = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission);
    setData({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || '',
    });
    setIsGradeDialogOpen(true);
  };

  // Handle form submission for grading
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    post(route('teacher.courses.homework.submissions.review', [course.id, homework.id, selectedSubmission.id]), {
      onSuccess: () => {
        setIsGradeDialogOpen(false);
        reset();
      },
    });
  };

  // Filter submissions to group them by graded and ungraded
  const ungradedSubmissions = homework.submissions.filter(
    (submission) => !submission.graded_at
  );
  
  const gradedSubmissions = homework.submissions.filter(
    (submission) => submission.graded_at
  );

  return (
    <AppLayout user={auth.user}>
      <Head title={`${homework.title} - Submissions`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={route('teacher.courses.homework.index', course.id)}>
                    <Button variant="outline" size="sm" className="mr-4">
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back to Homework
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold text-gray-800">{homework.title}</h1>
                </div>
                
                <Link href={route('teacher.courses.homework.edit', [course.id, homework.id])}>
                  <Button variant="outline">
                    Edit Assignment
                  </Button>
                </Link>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                  <CardDescription className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Due by {formatDate(homework.due_date)}
                    {isPastDueDate() && (
                      <span className="ml-2 text-red-500 font-medium">Deadline passed</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none mb-4">
                    <p>{homework.description}</p>
                  </div>
                  
                  {homework.attachment && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <span>Assignment Instructions</span>
                      </div>
                      <a
                        href={`/storage/${homework.attachment}`}
                        target="_blank"
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                      >
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 p-4">
                  <div className="text-sm text-gray-500">
                    <div><span className="font-medium">Course:</span> {course.title}</div>
                    <div><span className="font-medium">Created:</span> {formatDate(homework.created_at)}</div>
                    <div>
                      <span className="font-medium">Submissions:</span> {homework.submissions.length}
                      {ungradedSubmissions.length > 0 && (
                        <span className="ml-2 text-yellow-600">
                          ({ungradedSubmissions.length} ungraded)
                        </span>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {homework.submissions.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="text-center py-12">
                    <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-500">
                      No students have submitted work for this assignment yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {ungradedSubmissions.length > 0 && (
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <XCircleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                          Ungraded Submissions ({ungradedSubmissions.length})
                        </CardTitle>
                        <CardDescription>
                          These submissions are waiting for your review
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Submitted At</TableHead>
                              <TableHead>Attachment</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ungradedSubmissions.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="mr-2 bg-gray-100 rounded-full p-2">
                                      <UserIcon className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{submission.user.name}</div>
                                      <div className="text-sm text-gray-500">{submission.user.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                                    {formatDateTime(submission.submitted_at)}
                                    {new Date(submission.submitted_at) > new Date(homework.due_date) && (
                                      <span className="ml-2 text-xs text-red-500">Late</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {submission.attachment ? (
                                    <a
                                      href={`/storage/${submission.attachment}`}
                                      target="_blank"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                      <DownloadIcon className="h-4 w-4 mr-1" />
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">No attachment</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => openGradeDialog(submission)}
                                  >
                                    Grade Submission
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {gradedSubmissions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                          Graded Submissions ({gradedSubmissions.length})
                        </CardTitle>
                        <CardDescription>
                          These submissions have been reviewed and graded
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Submitted At</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Graded At</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {gradedSubmissions.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="mr-2 bg-gray-100 rounded-full p-2">
                                      <UserIcon className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{submission.user.name}</div>
                                      <div className="text-sm text-gray-500">{submission.user.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                                    {formatDate(submission.submitted_at)}
                                    {new Date(submission.submitted_at) > new Date(homework.due_date) && (
                                      <span className="ml-2 text-xs text-red-500">Late</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-lg font-semibold">
                                    {submission.grade}%
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {submission.graded_at && (
                                    <div className="flex items-center text-sm">
                                      <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                                      {formatDate(submission.graded_at)}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openGradeDialog(submission)}
                                  >
                                    Update Grade
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Grade Submission Dialog */}
              <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedSubmission?.graded_at ? 'Update Grade' : 'Grade Submission'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedSubmission?.user?.name}'s submission for {homework.title}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="border rounded-md p-4 mb-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Submission Content</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission?.content}</p>
                    
                    {selectedSubmission?.attachment && (
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center">
                          <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Attachment</span>
                        </div>
                        <a
                          href={`/storage/${selectedSubmission.attachment}`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                        >
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </div>
                    )}
                    
                    <div className="mt-4 border-t pt-4 text-sm text-gray-500">
                      Submitted on {selectedSubmission?.submitted_at ? formatDateTime(selectedSubmission.submitted_at) : '-'}
                      {selectedSubmission?.submitted_at && new Date(selectedSubmission.submitted_at) > new Date(homework.due_date) && (
                        <span className="ml-2 text-xs text-red-500">Late Submission</span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleGradeSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="grade">Grade (%)</Label>
                        <Input
                          id="grade"
                          type="number"
                          min="0"
                          max="100"
                          value={data.grade}
                          onChange={(e) => setData('grade', e.target.value)}
                          className={errors.grade ? 'border-red-500' : ''}
                        />
                        {errors.grade && (
                          <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="feedback">Feedback to Student</Label>
                        <Textarea
                          id="feedback"
                          value={data.feedback}
                          onChange={(e) => setData('feedback', e.target.value)}
                          rows={4}
                          className={errors.feedback ? 'border-red-500' : ''}
                        />
                        {errors.feedback && (
                          <p className="text-red-500 text-sm mt-1">{errors.feedback}</p>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button variant="outline" type="button" onClick={() => setIsGradeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={processing}>
                        {selectedSubmission?.graded_at ? 'Update' : 'Submit Grade'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 