import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Homework } from "@/types";
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
  FileText,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";
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
  homeworks: Homework[];
}

export default function Index({ auth, course, homeworks }: IndexProps) {
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
  
  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    
    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      return { 
        status: "expired", 
        badge: <Badge variant="outline" className="bg-red-50 text-red-700">Expired</Badge> 
      };
    }
    
    if (isToday(deadlineDate)) {
      return { 
        status: "today", 
        badge: <Badge variant="outline" className="bg-amber-50 text-amber-700">Due Today</Badge> 
      };
    }
    
    if (isFuture(deadlineDate)) {
      const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 3) {
        return { 
          status: "soon", 
          badge: <Badge variant="outline" className="bg-amber-50 text-amber-700">Due Soon</Badge> 
        };
      }
      
      return { 
        status: "upcoming", 
        badge: <Badge variant="outline" className="bg-green-50 text-green-700">Upcoming</Badge> 
      };
    }
    
    return { 
      status: "unknown", 
      badge: <Badge variant="outline">Unknown</Badge> 
    };
  };

  // Function to handle homework deletion
  const handleDelete = () => {
    if (homeworkToDelete) {
      window.location.href = route("admin.courses.homework.destroy", {
        course: course.id,
        homework: homeworkToDelete.id,
      });
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Course Homework - ${course.title}`} />

      <Dialog open={!!homeworkToDelete} onOpenChange={(open) => !open && setHomeworkToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Homework Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{homeworkToDelete?.title}"? This action cannot be undone 
              and will delete all associated student submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHomeworkToDelete(null)}>
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
            <h1 className="text-3xl font-bold">Course Homework</h1>
          </div>
          <Link href={route("admin.courses.homework.create", course.id)}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Homework
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Homework Assignments for {course.title}</CardTitle>
            <CardDescription>
              Manage homework assignments and view student submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {homeworks.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Title</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworks.map((homework) => {
                      const deadlineInfo = getDeadlineStatus(homework.deadline);
                      return (
                        <TableRow key={homework.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              {homework.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(homework.deadline), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {deadlineInfo.badge}
                          </TableCell>
                          <TableCell>
                            {homework.submissions ? (
                              <div className="flex gap-2 items-center">
                                <span className="text-sm">{homework.submissions.length}</span>
                                <div className="flex -space-x-1">
                                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs border border-white">
                                    <CheckCircle className="h-3 w-3" />
                                  </div>
                                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs border border-white">
                                    <XCircle className="h-3 w-3" />
                                  </div>
                                  <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs border border-white">
                                    <AlertCircle className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Link
                              href={route("admin.courses.homework.show", {
                                course: course.id,
                                homework: homework.id,
                              })}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                title="View homework"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={route("admin.courses.homework.edit", {
                                course: course.id,
                                homework: homework.id,
                              })}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Edit homework"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            {homework.attachment_path && (
                              <Link
                                href={route("admin.courses.homework.download", {
                                  course: course.id,
                                  homework: homework.id,
                                })}
                              >
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Download attachment"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setHomeworkToDelete(homework)}
                              title="Delete homework"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No homework assignments yet</h3>
                <p className="text-gray-500 mb-6">
                  Add homework assignments for students to submit their work
                </p>
                <Link href={route("admin.courses.homework.create", course.id)}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Homework
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 