import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Certificate } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Plus,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  UserCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IndexProps extends PageProps {
  course: Course;
  certificates: Certificate[];
}

export default function Index({ auth, course, certificates }: IndexProps) {
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);

  // Function to handle certificate deletion
  const handleDelete = () => {
    if (certificateToDelete) {
      window.location.href = route("admin.courses.certificates.destroy", {
        course: course.id,
        certificate: certificateToDelete.id,
      });
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Course Certificates - ${course.title}`} />

      <Dialog open={!!certificateToDelete} onOpenChange={(open) => !open && setCertificateToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the certificate for "{certificateToDelete?.user?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertificateToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.show", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Course Certificates</h1>
          </div>
          <Link href={route("admin.courses.certificates.create", course.id)}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Issue Certificate
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificates for {course.title}</CardTitle>
            <CardDescription>
              View and manage issued course completion certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificates.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Student</TableHead>
                      <TableHead>Certificate Number</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-blue-500" />
                            {certificate.user?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {certificate.certificate_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {format(new Date(certificate.issued_at), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={certificate.pdf_path ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}>
                            {certificate.pdf_path ? "Generated" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link
                            href={route("admin.courses.certificates.show", {
                              course: course.id,
                              certificate: certificate.id,
                            })}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              title="View certificate"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={route("admin.courses.certificates.download", {
                              course: course.id,
                              certificate: certificate.id,
                            })}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Download certificate"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setCertificateToDelete(certificate)}
                            title="Delete certificate"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates issued yet</h3>
                <p className="text-gray-500 mb-6">
                  Issue certificates to students who have successfully completed the course
                </p>
                {course.status === "completed" ? (
                  <Link href={route("admin.courses.certificates.create", course.id)}>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Issue First Certificate
                    </Button>
                  </Link>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    Course must be completed to issue certificates
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 