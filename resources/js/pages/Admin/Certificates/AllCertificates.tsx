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
import { Certificate, Course, User } from '@/types';

interface Props {
  certificates: (Certificate & {
    course: Course;
    user: User;
  })[];
}

export default function AllCertificates({ auth, certificates }: PageProps<Props>) {
  // Function to handle delete
  const handleRevoke = (courseId: number, certificateId: number) => {
    if (confirm('Are you sure you want to revoke this certificate?')) {
      router.delete(route('admin.all.certificates.destroy', certificateId));
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="All Certificates" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">All Issued Certificates</CardTitle>
              <Link href={route('admin.all.certificates.create')}>
                <Button>
                  Create Certificate
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No certificates have been issued yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Number</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-semibold">{certificate.certificate_number}</TableCell>
                        <TableCell>
                          <Link href={route('admin.courses.show', certificate.course.id)} className="text-blue-600 hover:underline">
                            {certificate.course.title}
                          </Link>
                        </TableCell>
                        <TableCell>{certificate.user.name}</TableCell>
                        <TableCell>{format(new Date(certificate.issued_at), 'PPP')}</TableCell>
                        <TableCell>{certificate.achievement}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('admin.all.certificates.show', certificate.id)}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRevoke(certificate.course.id, certificate.id)}
                            >
                              Revoke
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