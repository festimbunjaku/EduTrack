import React, { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  FileIcon, 
  PlusIcon, 
  SearchIcon, 
  CalendarIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  UsersIcon
} from 'lucide-react';

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  submissions_count: number;
}

interface Course {
  id: number;
  title: string;
}

interface IndexProps extends PageProps {
  course: Course;
  homeworks: Homework[];
}

export default function Index({ auth, course, homeworks }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if homework is past due date
  const isPastDueDate = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  // Filter homeworks based on search term
  const filteredHomeworks = homeworks.filter((homework) =>
    homework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homework.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout user={auth.user}>
      <Head title={`${course.title} - Homework`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={route('teacher.courses.show', course.id)}>
                    <Button variant="outline" size="sm" className="mr-4">
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back to Course
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold text-gray-800">{course.title} - Homework</h1>
                </div>
                
                <Link href={route('teacher.courses.homework.create', course.id)}>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Assign New Homework
                  </Button>
                </Link>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search homework..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredHomeworks.length === 0 ? (
                <div className="text-center py-12">
                  {homeworks.length === 0 ? (
                    <div>
                      <p className="text-gray-500 text-lg mb-4">
                        No homework assignments created for this course yet.
                      </p>
                      <Link href={route('teacher.courses.homework.create', course.id)}>
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Your First Assignment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-lg">
                      No homework assignments match your search.
                    </p>
                  )}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Homework Assignments</CardTitle>
                    <CardDescription>
                      {filteredHomeworks.length} assignment{filteredHomeworks.length !== 1 && 's'} for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHomeworks.map((homework) => (
                          <TableRow key={homework.id}>
                            <TableCell className="font-medium">{homework.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <span className={isPastDueDate(homework.due_date) ? 'text-red-500' : ''}>
                                  {formatDate(homework.due_date)}
                                </span>
                                {isPastDueDate(homework.due_date) && (
                                  <span className="ml-2 text-xs text-red-500">Passed</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-1 text-blue-500" />
                                {homework.submissions_count} 
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {formatDate(homework.created_at)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Link href={route('teacher.courses.homework.show', [course.id, homework.id])}>
                                <Button variant="outline" size="sm">View Submissions</Button>
                              </Link>
                              <Link href={route('teacher.courses.homework.edit', [course.id, homework.id])}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 