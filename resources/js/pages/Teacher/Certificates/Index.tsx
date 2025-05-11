import { Link, Head, router } from '@inertiajs/react';
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
import { format } from 'date-fns';
import { Certificate, Course, User } from '@/types';

interface Props {
  certificates: (Certificate & {
    user: User;
  })[];
  course: Course;
}

export default function CertificatesIndex({ certificates, course }: PageProps<Props>) {
  const handleRevoke = (courseId: number, certificateId: number) => {
    router.delete(route('teacher.courses.certificates.destroy', [courseId, certificateId]));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Courses', href: route('teacher.courses.index') },
        { label: course.title, href: route('teacher.courses.show', course.id) },
        { label: 'Certificates', href: '#' }
      ]}
    >
      <Head title={`${course.title} - Certificates`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{course.title} - Certificates</h1>
            <Link href={route('teacher.courses.certificates.create', course.id)}>
              <Button>Issue New Certificate</Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No certificates have been issued yet for this course.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Number</TableHead>
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
                        <TableCell>{certificate.user.name}</TableCell>
                        <TableCell>{format(new Date(certificate.issued_at), 'PPP')}</TableCell>
                        <TableCell>{certificate.achievement}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('teacher.courses.certificates.show', [course.id, certificate.id])}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRevoke(course.id, certificate.id)}
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