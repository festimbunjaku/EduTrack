import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, UsersIcon, FilterIcon } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  enrollments_count: number;
}

interface IndexProps extends PageProps {
  courses: Course[];
  filters: {
    search: string;
    status: string;
    sort_field: string;
    sort_direction: string;
  };
  statuses: {
    [key: string]: string;
  };
}

export default function Index({ auth, courses, filters, statuses }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'start_date');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Function to apply filters
  const applyFilters = () => {
    router.get(
      route('teacher.courses.index'),
      {
        search: searchTerm,
        status: selectedStatus,
        sort_field: sortField,
        sort_direction: sortDirection,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  // Function to reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSortField('start_date');
    setSortDirection('desc');
    
    router.get(
      route('teacher.courses.index'),
      {},
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="My Courses" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">My Courses</h1>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      className="w-40"
                    >
                      <option value="">All Statuses</option>
                      {Object.entries(statuses).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    
                    <Button onClick={applyFilters} variant="outline" size="sm">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    
                    <Button onClick={resetFilters} variant="ghost" size="sm">
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    You don't have any courses yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                        <div className="flex justify-between items-center">
                          <Badge className={getStatusBadgeColor(course.status)}>
                            {statuses[course.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>
                              {formatDate(course.start_date)} - {formatDate(course.end_date)}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            <span>{course.enrollments_count} Students Enrolled</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-gray-50 py-3">
                        <div className="w-full flex justify-end">
                          <Link href={route('teacher.courses.show', course.id)}>
                            <Button>Manage Course</Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 