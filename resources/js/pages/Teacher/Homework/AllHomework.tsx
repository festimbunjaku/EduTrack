import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, FileIcon, PlusIcon, SearchIcon, ClipboardListIcon, UsersIcon } from 'lucide-react';

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  submissions_count: number;
  created_at: string;
  course: {
    id: number;
    title: string;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
}

interface AllHomeworkProps extends PageProps {
  homeworks: Homework[];
  courses: Course[];
  courseCount: number;
  totalSubmissions: number;
  pendingCount: number;
}

export default function AllHomework({ homeworks, courses, courseCount, totalSubmissions, pendingCount }: AllHomeworkProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter homework based on search
  const filteredHomework = homeworks.filter(homework => 
    homework.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    homework.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get upcoming and past homework
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingHomework = filteredHomework.filter(homework => {
    const dueDate = new Date(homework.due_date);
    return dueDate >= today;
  });
  
  const pastHomework = filteredHomework.filter(homework => {
    const dueDate = new Date(homework.due_date);
    return dueDate < today;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if a homework is past due
  const isPastDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    return dueDate < today;
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Homework', href: '#' }]}>
      <Head title="All Homework" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Courses</p>
                  <p className="text-3xl font-bold mt-1">{courseCount}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileIcon className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Homework</p>
                  <p className="text-3xl font-bold mt-1">{homeworks.length}</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <ClipboardListIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                  <p className="text-3xl font-bold mt-1">{pendingCount}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">All Homework</h1>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search homework..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Homework ({filteredHomework.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingHomework.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastHomework.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {filteredHomework.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHomework.map((homework) => (
                          <TableRow key={homework.id}>
                            <TableCell className="font-medium">
                              <Link 
                                href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link 
                                href={route('teacher.courses.show', homework.course_id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.course.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <span className={isPastDue(homework.due_date) ? 'text-red-600' : ''}>
                                  {formatDate(homework.due_date)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {homework.submissions_count} submissions
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                                <Link 
                                  href={route('teacher.courses.homework.edit', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardListIcon className="h-12 w-12 text-gray-400 mb-4" />
                    {searchQuery ? (
                      <>
                        <p className="text-xl font-semibold mb-2">No matching homework found</p>
                        <p className="text-gray-500 mb-4">No homework assignments match your search query "{searchQuery}".</p>
                        <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-semibold mb-2">No homework assignments yet</p>
                        <p className="text-gray-500 mb-4">You haven't created any homework assignments yet.</p>
                        {courses.length > 0 && (
                          <Link href={route('teacher.courses.homework.create', courses[0].id)}>
                            <Button>Create First Assignment</Button>
                          </Link>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingHomework.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingHomework.map((homework) => (
                          <TableRow key={homework.id}>
                            <TableCell className="font-medium">
                              <Link 
                                href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link 
                                href={route('teacher.courses.show', homework.course_id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.course.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                {formatDate(homework.due_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {homework.submissions_count} submissions
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                                <Link 
                                  href={route('teacher.courses.homework.edit', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardListIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl font-semibold mb-2">No upcoming homework</p>
                    <p className="text-gray-500 mb-4">You don't have any upcoming homework assignments.</p>
                    {courses.length > 0 && (
                      <Link href={route('teacher.courses.homework.create', courses[0].id)}>
                        <Button>Create New Assignment</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastHomework.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastHomework.map((homework) => (
                          <TableRow key={homework.id}>
                            <TableCell className="font-medium">
                              <Link 
                                href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link 
                                href={route('teacher.courses.show', homework.course_id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {homework.course.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-red-600">
                                  {formatDate(homework.due_date)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {homework.submissions_count} submissions
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  href={route('teacher.courses.homework.show', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                                <Link 
                                  href={route('teacher.courses.homework.edit', [homework.course_id, homework.id])}
                                >
                                  <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardListIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl font-semibold mb-2">No past homework</p>
                    <p className="text-gray-500 mb-4">You don't have any past homework assignments.</p>
                    {courses.length > 0 && (
                      <Link href={route('teacher.courses.homework.create', courses[0].id)}>
                        <Button>Create New Assignment</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
} 