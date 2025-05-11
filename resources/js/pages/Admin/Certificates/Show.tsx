import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Certificate, User } from "@/types";
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
  User as UserIcon,
  FileText,
  Trash2,
  BookOpen,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ShowProps extends PageProps {
  certificate: Certificate & {
    user: User;
  };
  course: Course;
}

export default function Show({ auth, certificate, course }: ShowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Certificate: ${certificate.certificate_number}`} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Link
              href={route("admin.all.certificates.destroy", certificate.id)}
              method="delete"
              as="button"
              className="focus:outline-none"
            >
              <Button variant="destructive">
                Delete
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.all.certificates.index")}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to All Certificates
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Certificate Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={route("admin.all.certificates.download", certificate.id)}
            >
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
                  {certificate.user.name}
                </div>
                <div className="mb-8">
                  has successfully completed the course
                </div>
                <div className="text-2xl font-semibold text-blue-700 mb-10">
                  {course.title}
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
                
                <div className="flex items-center justify-center gap-6 text-sm">
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
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Certificate ID</div>
                    <div className="text-sm text-gray-700">{certificate.certificate_number}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Issue Date</div>
                    <div className="text-sm text-gray-700">
                      {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Student</div>
                    <div className="text-sm text-gray-700">{certificate.user.name}</div>
                    <div className="text-xs text-gray-500">{certificate.user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Course</div>
                    <div className="text-sm text-gray-700">
                      <Link 
                        href={route("admin.courses.show", course.id)} 
                        className="text-blue-600 hover:underline"
                      >
                        {course.title}
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">PDF Status</div>
                    <div className="text-sm">
                      {certificate.pdf_path ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Generated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          Pending Generation
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  href={route("admin.all.certificates.download", certificate.id)}
                  className="w-full"
                >
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 