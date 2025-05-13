import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AdminLayout from '@/layouts/AdminLayout';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  UploadIcon,
  UserIcon,
  DownloadIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  created_at: string;
  status: string;
  teacher_comments?: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  deadline: string;
  attachment_path?: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
}

interface SubmissionProps extends PageProps {
  course: Course;
  homework: Homework;
  submission: HomeworkSubmission;
}

export default function Submission({ auth, course, homework, submission }: SubmissionProps) {
  const { data, setData, errors, post, processing } = useForm({
    status: submission.status || 'pending',
    teacher_comments: submission.teacher_comments || '',
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Error formatting date';
    }
  };

  // Function to format date with time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Error formatting date';
    }
  };

  // Check if submission was late
  const isLateSubmission = () => {
    try {
      const submittedAt = new Date(submission.submitted_at || submission.created_at);
      const dueDate = new Date(homework.deadline);
      return submittedAt > dueDate;
    } catch (error) {
      return false;
    }
  };

  // Handle form submission for reviewing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.homework.submissions.review', [homework.id, submission.id]), {
      preserveScroll: true,
    });
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title={`Student Submission - ${homework.title}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={route('admin.all.homework.show', homework.id)}>
                    <Button variant="outline" size="sm" className="mr-4">
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back to All Submissions
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold text-gray-800">Student Submission</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          Submission for: {homework.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={isLateSubmission() ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}
                          >
                            {isLateSubmission() ? "Late Submission" : "On Time"}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        Submitted on {formatDateTime(submission.created_at || submission.submitted_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Student's Answer</h3>
                        <div className="bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                          {submission.content}
                        </div>
                      </div>

                      {submission.attachment && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Student's Attachment</h3>
                          <div className="bg-gray-50 p-4 rounded-md border flex items-center justify-between">
                            <div className="flex items-center">
                              <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <span>Attachment</span>
                            </div>
                            <a
                              href={`/storage/${submission.attachment}`}
                              target="_blank"
                              className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm"
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Review Submission</CardTitle>
                      <CardDescription>
                        Provide feedback and set the status for this submission
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={data.status} 
                            onValueChange={(value) => setData('status', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.status && (
                            <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="teacher_comments">Feedback Comments</Label>
                          <Textarea
                            id="teacher_comments"
                            value={data.teacher_comments}
                            onChange={(e) => setData('teacher_comments', e.target.value)}
                            rows={4}
                          />
                          {errors.teacher_comments && (
                            <p className="text-red-500 text-sm mt-1">{errors.teacher_comments}</p>
                          )}
                        </div>

                        <div>
                          <Button type="submit" disabled={processing}>
                            Save Review
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{submission.user.name}</div>
                          <div className="text-sm text-gray-500">{submission.user.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Submission Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Course</div>
                        <div className="flex items-center gap-2">
                          <p>{course.title}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Homework</div>
                        <div className="flex items-center gap-2">
                          <p>{homework.title}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500">Submitted On</div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <p>{formatDateTime(submission.created_at || submission.submitted_at)}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500">Status</div>
                        <div className="mt-1">
                          {submission.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Pending
                            </Badge>
                          )}
                          {submission.status === "approved" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Approved
                            </Badge>
                          )}
                          {submission.status === "denied" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Denied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 