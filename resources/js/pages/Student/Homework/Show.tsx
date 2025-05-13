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
  XCircleIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Course {
  id: number;
  title: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  attachment: string | null;
}

interface Submission {
  id: number;
  content: string;
  attachment: string | null;
  submitted_at: string;
  status: 'submitted' | 'graded';
  feedback: string | null;
  grade: number | null;
}

interface ShowProps extends PageProps {
  course: Course;
  homework: Homework;
  submission: Submission | null;
}

export default function Show({ auth, course, homework, submission }: ShowProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    content: submission?.content || '',
    attachment: null as File | null,
  });
  
  // Check if due date has passed
  const isDueDatePassed = () => {
    try {
      const dueDate = new Date(homework.due_date);
      // Check if the date is valid
      if (isNaN(dueDate.getTime())) {
        console.error("Invalid due date", homework.due_date);
        return false;
      }
      return new Date() > dueDate;
    } catch (error) {
      console.error("Error parsing due date:", error);
      return false;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", dateString);
        return "Invalid date";
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setData('attachment', file);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('student.homework.submit', homework.id), {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedFile(null);
      },
    });
  };
  
  // Get submission status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AppLayout user={auth.user}>
      <Head title={`${homework.title} - ${course.title}`} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link href={route('student.courses.show', course.id)}>
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">{homework.title}</h1>
                <p className="text-sm text-gray-600">{course.title}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                <span className={isDueDatePassed() ? 'text-red-500' : 'text-gray-600'}>
                  Due: {formatDate(homework.due_date)}
                </span>
              </div>
              
              {isDueDatePassed() && (
                <Badge variant="destructive">Past Due</Badge>
              )}
              
              {submission && (
                <Badge className={`ml-2 ${getStatusColor(submission.status)}`}>
                  {submission.status === 'submitted' ? 'Submitted' : 'Graded'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: homework.description }} />
                </CardContent>
                {homework.attachment && (
                  <CardFooter className="border-t">
                    <div className="flex items-center">
                      <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <a 
                        href={`/storage/${homework.attachment}`} 
                        target="_blank" 
                        className="text-blue-600 hover:underline"
                      >
                        Download Assignment Files
                      </a>
                    </div>
                  </CardFooter>
                )}
              </Card>
              
              {submission && submission.status === 'graded' && (
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                      Graded Work
                    </CardTitle>
                    <CardDescription>
                      Grade: <span className="font-bold text-green-700">{submission.grade}/100</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <div className="bg-gray-50 p-4 rounded border">
                      {submission.feedback ? (
                        <p>{submission.feedback}</p>
                      ) : (
                        <p className="text-gray-500 italic">No specific feedback provided.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {!isDueDatePassed() && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {submission ? 'Update Your Submission' : 'Submit Your Work'}
                    </CardTitle>
                    <CardDescription>
                      {submission 
                        ? 'You can update your submission until the due date.' 
                        : 'Submit your work before the deadline.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="content">Your Answer</Label>
                          <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={8}
                            placeholder="Type your answer here..."
                            className="resize-none mt-1"
                          />
                          {errors.content && (
                            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="attachment">Attachment (Optional)</Label>
                          <div className="mt-1">
                            <Input
                              id="attachment"
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('attachment')?.click()}
                                className="mr-2"
                              >
                                <UploadIcon className="h-4 w-4 mr-2" />
                                {selectedFile ? 'Change File' : 'Upload File'}
                              </Button>
                              {selectedFile && (
                                <div className="flex items-center bg-blue-50 px-3 py-2 rounded">
                                  <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                                  <span className="text-sm">{selectedFile.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedFile(null);
                                      setData('attachment', null);
                                    }}
                                    className="ml-2 h-6 w-6 p-0"
                                  >
                                    <XCircleIcon className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {errors.attachment && (
                              <p className="text-red-500 text-xs mt-1">{errors.attachment}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={processing}
                            className="w-full md:w-auto"
                          >
                            {submission ? 'Update Submission' : 'Submit Homework'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Submission Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                        <span className="font-medium">Submitted</span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Submitted on:</p>
                        <p className="font-medium">
                          {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                      
                      {submission.attachment && (
                        <div>
                          <p className="text-sm text-gray-500">Your attachment:</p>
                          <a 
                            href={`/storage/${submission.attachment}`}
                            target="_blank"
                            className="text-blue-600 hover:underline flex items-center mt-1"
                          >
                            <FileIcon className="h-4 w-4 mr-2" />
                            View Attachment
                          </a>
                        </div>
                      )}
                      
                      {submission.status === 'graded' ? (
                        <div className="bg-green-50 p-3 rounded">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                            <span className="font-medium">Graded</span>
                          </div>
                          <p className="text-sm mt-1">
                            Grade: <span className="font-bold">{submission.grade}/100</span>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
                            <span className="font-medium">Awaiting Feedback</span>
                          </div>
                          <p className="text-sm mt-1">
                            Your submission is waiting to be reviewed.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : isDueDatePassed() ? (
                    <Alert variant="destructive">
                      <AlertTitle className="flex items-center">
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Missed Deadline
                      </AlertTitle>
                      <AlertDescription>
                        The due date for this assignment has passed. You can no longer submit your work.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertTitle className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Pending Submission
                      </AlertTitle>
                      <AlertDescription>
                        You have not submitted this assignment yet. The deadline is on {formatDate(homework.due_date)}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 