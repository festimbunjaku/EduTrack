import { Link, Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Homework, Course } from '@/types';
import { FileTextIcon, CheckIcon, XIcon, ClockIcon } from 'lucide-react';

interface Props {
  homeworks: (Homework & {
    course: Course;
  })[];
}

export default function AllHomework({ auth, homeworks }: PageProps<Props>) {
  // Function to render deadline status
  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    } 
    
    // If deadline is within the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    if (deadlineDate < threeDaysFromNow) {
      return <Badge className="bg-yellow-100 text-yellow-800">Soon</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  // Function to handle delete
  const handleDelete = (courseId: number, homeworkId: number) => {
    if (confirm('Are you sure you want to delete this homework?')) {
      router.delete(route('admin.all.homework.destroy', homeworkId));
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="All Homework Assignments" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">All Homework Assignments</CardTitle>
              <Link href={route('admin.all.homework.create')}>
                <Button>
                  Create Homework
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {homeworks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No homework assignments have been created yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworks.map((homework) => (
                      <TableRow key={homework.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileTextIcon size={16} />
                            {homework.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={route('admin.courses.show', homework.course.id)} className="text-blue-600 hover:underline">
                            {homework.course.title}
                          </Link>
                        </TableCell>
                        <TableCell>{format(new Date(homework.deadline), 'PPP')}</TableCell>
                        <TableCell>{getDeadlineStatus(homework.deadline)}</TableCell>
                        <TableCell>
                          {homework.submissions_count ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{homework.submissions_count}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No submissions</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('admin.all.homework.show', homework.id)}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link href={route('admin.all.homework.edit', homework.id)}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(homework.course.id, homework.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 