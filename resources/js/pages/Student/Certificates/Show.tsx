import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Certificate } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  ChevronLeft,
  Download,
  Calendar,
  BookOpen,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface ShowProps extends PageProps {
  certificate: Certificate;
}

export default function Show({ auth, certificate }: ShowProps) {
  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Certificate: ${certificate.certificate_number}`} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route("student.certificates.index")}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Certificates
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Certificate</h1>
          </div>
          {certificate.pdf_path && (
            <Link href={route("student.certificates.download", certificate.id)}>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Certificate
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-12 right-0 w-32 h-32 opacity-5">
                <Award className="w-full h-full" />
              </div>
              <CardHeader className="text-center border-b pb-6">
                <CardTitle className="text-3xl font-bold mt-4">Certificate of Completion</CardTitle>
                <CardDescription className="text-lg">
                  This is to certify that
                </CardDescription>
              </CardHeader>
              <CardContent className="py-10 text-center">
                <div className="text-2xl font-bold mb-6">
                  {auth.user.name}
                </div>
                <div className="mb-8">
                  has successfully completed the course
                </div>
                <div className="text-2xl font-semibold text-blue-700 mb-10">
                  {certificate.course?.title}
                </div>
                
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-16 border-b border-gray-300">
                    {certificate.signature && (
                      <img 
                        src={`/storage/${certificate.signature}`} 
                        alt="Teacher Signature" 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
                <div className="text-sm mb-10">
                  Teacher's Signature
                </div>

                <div className="flex justify-center gap-8 items-center mt-8 text-gray-600">
                  <div>
                    <div className="font-semibold">Issue Date</div>
                    <div>{format(new Date(certificate.issued_at), "MMMM d, yyyy")}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Certificate ID</div>
                    <div>{certificate.certificate_number}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Issue Date</div>
                    <div className="text-sm text-gray-700">{format(new Date(certificate.issued_at), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Course</div>
                    <div className="text-sm text-gray-700">{certificate.course?.title}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">PDF Status</div>
                    <div className="text-sm">
                      {certificate.pdf_path ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Available for Download
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          Not Available Yet
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {certificate.pdf_path && (
                <CardFooter>
                  <Link className="w-full" href={route("student.certificates.download", certificate.id)}>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 