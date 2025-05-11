import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ClockIcon, BookIcon, UserIcon, BookOpenIcon, GraduationCap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Course {
  id: number;
  title: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  teacher: {
    id: number;
    name: string;
  };
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

interface CourseCardProps {
  course: Course;
  statuses: {
    [key: string]: string;
  };
}

// Function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'secondary';
    case 'active':
      return 'default';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const CourseCard = ({ course, statuses }: CourseCardProps) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
    <CardHeader className="pb-3 space-y-1">
      <div className="flex justify-between items-start">
        <Badge variant={getStatusBadgeVariant(course?.status || '')} className="mb-2">
          {statuses && course?.status && statuses[course.status] ? statuses[course.status] : course?.status || 'Unknown'}
        </Badge>
        <div className="flex items-center text-muted-foreground text-xs">
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>{formatDate(course?.start_date || '')}</span>
        </div>
      </div>
      <CardTitle className="text-lg">{course?.title || 'Untitled Course'}</CardTitle>
    </CardHeader>
    
    <CardContent className="flex-grow">
      <p className="text-muted-foreground line-clamp-3 mb-4 text-sm">{course?.description || 'No description available'}</p>
      
      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground mt-4">
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-2 text-primary/70" />
          <span>{course?.teacher?.name || 'Unknown Instructor'}</span>
        </div>
        
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 text-primary/70" />
          <span>Ends {formatDate(course?.end_date || '')}</span>
        </div>
      </div>
    </CardContent>
    
    <CardFooter className="bg-muted/30 pt-4 pb-4">
      <Link href={route('student.courses.show', course?.id || 0)} className="w-full">
        <Button className="w-full">View Course</Button>
      </Link>
    </CardFooter>
  </Card>
);

export default function Index({ auth, courses, statuses }: IndexProps) {
  // Group courses by status, with proper error handling
  const coursesArray = Array.isArray(courses) ? courses : [];
  
  // Group courses by status
  const activeCourses = coursesArray.filter(course => course?.status === 'active') || [];
  const upcomingCourses = coursesArray.filter(course => course?.status === 'upcoming') || [];
  const completedCourses = coursesArray.filter(course => course?.status === 'completed') || [];
  const cancelledCourses = coursesArray.filter(course => course?.status === 'cancelled') || [];

  const breadcrumbs = [
    { title: 'Courses', href: route('student.courses.index') },
    { title: 'My Courses', href: route('student.courses.index') },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <Head title="My Courses" />

      <div className="space-y-6 p-6">
        <PageHeader
          title="My Courses"
          description="Access your enrolled courses and learning materials"
        />

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="active" className="relative">
              Active
              {activeCourses.length > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 inline-flex items-center justify-center">
                  {activeCourses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-6">
            {activeCourses.length === 0 ? (
              <EmptyState 
                icon={<BookOpenIcon className="h-10 w-10 text-muted-foreground" />}
                title="No Active Courses"
                description="You don't have any active courses at the moment."
                actionText="Discover Courses"
                actionHref={route('student.courses.discover')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map((course) => (
                  <CourseCard key={course.id} course={course} statuses={statuses} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingCourses.length === 0 ? (
              <EmptyState 
                icon={<CalendarIcon className="h-10 w-10 text-muted-foreground" />}
                title="No Upcoming Courses"
                description="You don't have any upcoming courses scheduled."
                actionText="Discover Courses"
                actionHref={route('student.courses.discover')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} statuses={statuses} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            {completedCourses.length === 0 ? (
              <EmptyState 
                icon={<GraduationCap className="h-10 w-10 text-muted-foreground" />}
                title="No Completed Courses"
                description="You haven't completed any courses yet."
                actionText="Discover Courses"
                actionHref={route('student.courses.discover')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} statuses={statuses} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-6">
            {!coursesArray || coursesArray.length === 0 ? (
              <EmptyState 
                icon={<BookIcon className="h-10 w-10 text-muted-foreground" />}
                title="No Enrolled Courses"
                description="You are not enrolled in any courses yet."
                actionText="Discover Courses"
                actionHref={route('student.courses.discover')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesArray.map((course) => (
                  <CourseCard key={course.id} course={course} statuses={statuses} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppSidebarLayout>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

function EmptyState({ icon, title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Link href={actionHref}>
        <Button>{actionText}</Button>
      </Link>
    </div>
  );
}

interface CourseSectionProps {
  title: string;
  courses: Course[];
  statuses: {
    [key: string]: string;
  };
}

function CourseSection({ title, courses, statuses }: CourseSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <Badge variant="outline">{courses.length}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} statuses={statuses} />
        ))}
      </div>
      <Separator className="my-6" />
    </div>
  );
}