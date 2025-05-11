import { Link, Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  certificate: Certificate & {
    course: Course;
    user: User;
    issuer: User;
  };
  course: Course;
}

export default function ShowCertificate({ certificate, course }: PageProps<Props>) {
  const handleRevoke = (certificateId: number) => {
    router.delete(route('teacher.certificates.destroy', certificateId));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Courses', href: route('teacher.courses.index') },
        { label: course.title, href: route('teacher.courses.show', course.id) },
        { label: 'Certificates', href: route('teacher.courses.certificates.index', course.id) },
        { label: 'Certificate Details', href: '#' }
      ]}
    >
      <Head title="Certificate Details" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/10">
            <CardHeader className="text-center border-b pb-10">
              <CardTitle className="text-3xl font-bold text-center">Certificate of Completion</CardTitle>
              <CardDescription className="text-xl mt-2">
                {certificate.certificate_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-10">
              <div className="text-center mb-8">
                <p className="text-xl mb-2">This is to certify that</p>
                <h3 className="text-2xl font-bold">{certificate.user.name}</h3>
                <p className="text-lg mt-2">
                  has successfully completed the course
                </p>
                <h3 className="text-2xl font-bold mt-1">{certificate.course.title}</h3>
                <p className="text-lg mt-4">
                  with achievement: <span className="font-semibold">{certificate.achievement}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 text-sm">
                <div>
                  <p className="font-semibold">Issue Date:</p>
                  <p>{format(new Date(certificate.issued_at), 'PPP')}</p>
                </div>
                <div>
                  <p className="font-semibold">Completion Date:</p>
                  <p>{format(new Date(certificate.completion_date), 'PPP')}</p>
                </div>
                <div>
                  <p className="font-semibold">Issued By:</p>
                  <p>{certificate.issuer.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Student:</p>
                  <p>{certificate.user.name}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Link href={route('teacher.certificates.index')}>
                <Button variant="outline">Back to All Certificates</Button>
              </Link>
              <div className="flex space-x-2">
                <Button variant="outline">Download</Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleRevoke(certificate.id)}
                >
                  Revoke Certificate
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 