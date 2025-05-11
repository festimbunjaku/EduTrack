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
import { Badge } from '@/components/ui/badge';
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Homework {
  id: number;
  title: string;
  due_date: string;
  is_submitted: boolean;
  is_graded: boolean;
  grade: number | null;
  course: {
    id: number;
    title: string;
    image: string | null;
  };
}

interface IndexProps extends PageProps {
  homeworks: Homework[];
  upcoming_count: number;
  completed_count: number;
  overdue_count: number;
}

export default function Index({ auth, homeworks, upcoming_count, completed_count, overdue_count }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days remaining or overdue
  const getDaysStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'text-orange-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-red-600 font-medium' };
    } else {
      return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`, color: 'text-red-600' };
    }
  };

  // Get status badge color
  const getStatusBadge = (homework: Homework) => {
    if (homework.is_graded) {
      return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
    } else if (homework.is_submitted) {
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    } else if (new Date() > new Date(homework.due_date)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Get unique courses for filter
  const courses = [...new Set(homeworks.map(hw => hw.course.title))];

  // Apply filters to homeworks
  const filteredHomeworks = homeworks.filter(homework => {
    // Search term filter
    const matchesSearch = homework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      homework.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Course filter
    const matchesCourse = courseFilter === 'all' || homework.course.title === courseFilter;
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'submitted') matchesStatus = homework.is_submitted && !homework.is_graded;
    else if (statusFilter === 'graded') matchesStatus = homework.is_graded;
    else if (statusFilter === 'pending') matchesStatus = !homework.is_submitted && new Date() <= new Date(homework.due_date);
    else if (statusFilter === 'overdue') matchesStatus = !homework.is_submitted && new Date() > new Date(homework.due_date);
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'upcoming') matchesTab = !homework.is_submitted && new Date() <= new Date(homework.due_date);
    else if (activeTab === 'completed') matchesTab = homework.is_submitted || homework.is_graded;
    else if (activeTab === 'overdue') matchesTab = !homework.is_submitted && new Date() > new Date(homework.due_date);
    
    return matchesSearch && matchesCourse && matchesStatus && matchesTab;
  });

  return (
    <AppLayout user={auth.user}>
      <Head title="My Homework" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">My Homework</h1>
            <p className="text-gray-600">View and manage all your homework assignments</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-4">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold">{upcoming_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">{completed_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 mr-4">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold">{overdue_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="relative w-full md:w-96">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search homework or course..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course, index) => (
                        <SelectItem key={index} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredHomeworks.length === 0 ? (
                <div className="text-center py-8">
                  <FileTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No homework found</h3>
                  <p className="text-gray-500">
                    {searchTerm || courseFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters to see more results'
                      : 'You have no homework assignments at the moment'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                      {filteredHomeworks.map((homework) => {
                        const daysStatus = getDaysStatus(homework.due_date);
                        
                        return (
                          <TableRow key={homework.id}>
                            <TableCell className="font-medium">
                              {homework.title}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 overflow-hidden">
                                  {homework.course.image ? (
                                    <img 
                                      src={`/storage/${homework.course.image}`} 
                                      alt={homework.course.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <BookOpenIcon className="h-4 w-4 text-gray-500" />
                                  )}
                                </div>
                                <span>{homework.course.title}</span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div>
                                <div className="text-sm">{formatDate(homework.due_date)}</div>
                                {!homework.is_submitted && (
                                  <div className={`text-xs ${daysStatus.color}`}>
                                    {daysStatus.text}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {getStatusBadge(homework)}
                              {homework.is_graded && homework.grade !== null && (
                                <div className="text-sm mt-1 font-medium">
                                  Grade: {homework.grade}/100
                                </div>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <Link href={route('student.homework.show', [homework.course.id, homework.id])}>
                                <Button size="sm" variant={homework.is_submitted ? "outline" : "default"}>
                                  {homework.is_submitted ? 'View Submission' : 'Submit'}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 