import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
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
import { router } from '@inertiajs/react';

interface Props {
  certificates: (Certificate & {
    course: Course;
    user: User;
  })[];
}

export default function AllCertificates({ auth, certificates }: PageProps<Props>) {
  const handleRevoke = (certificateId: number) => {
    router.delete(route('teacher.certificates.destroy', certificateId));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Certificates', href: '#' }
      ]}
    >
      <Head title="All Certificates" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">All Issued Certificates</CardTitle>
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
                          <Link href={route('teacher.courses.show', certificate.course.id)} className="text-blue-600 hover:underline">
                            {certificate.course.title}
                          </Link>
                        </TableCell>
                        <TableCell>{certificate.user.name}</TableCell>
                        <TableCell>{format(new Date(certificate.issued_at), 'PPP')}</TableCell>
                        <TableCell>{certificate.achievement}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('teacher.certificates.show', certificate.id)}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRevoke(certificate.id)}
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
    </AppLayout>
  );
} 