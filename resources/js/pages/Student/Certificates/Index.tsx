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
} from "@/components/ui/card";
import { Award, Eye, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CertificateProps extends PageProps {
  certificates: Certificate[];
}

export default function Index({ auth, certificates }: CertificateProps) {
  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="My Certificates" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Certificates</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Course Completion Certificates
            </CardTitle>
            <CardDescription>
              View and download your course completion certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificates.length > 0 ? (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col mb-3 sm:mb-0">
                      <div className="font-semibold text-lg">
                        {certificate.course?.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued on {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Certificate ID: {certificate.certificate_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link href={route("student.certificates.show", certificate.id)}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {certificate.pdf_path && (
                        <a href={`/student/certificates/${certificate.id}/download`} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                <p className="text-gray-500 mb-4">
                  You will receive certificates after successfully completing courses
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 