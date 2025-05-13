import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Homework } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ChevronLeft,
  Download,
  Calendar,
  Edit,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { formatBytes } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShowProps extends PageProps {
  homework: Homework & {
    submissions: any[];
  };
  course: Course;
  submissionStats: {
    total: number;
    pending: number;
    approved: number;
    denied: number;
  };
}

export default function Show({ auth, homework, course, submissionStats }: ShowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Function to handle homework deletion
  const handleDelete = () => {
    window.location.href = route("admin.all.homework.destroy", homework.id);
  };

  // Get deadline status
  const isDeadlinePassed = isPast(new Date(homework.deadline));
  
  // Format the max score to an integer if it's a whole number
  const formattedMaxScore = parseFloat(homework.max_score) % 1 === 0 
    ? parseInt(homework.max_score).toString() 
    : homework.max_score;

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Homework: ${homework.title}`} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Homework Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{homework.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route("admin.all.homework.index")}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to All Homework
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Homework Details</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={route("admin.all.homework.edit", homework.id)}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Homework
              </Button>
            </Link>
            {homework.attachment_path && (
              <a
                href={`/admin/all/homework/${homework.id}/download`}
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-25 transition"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Attachment
              </a>
            )}
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{homework.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={isDeadlinePassed ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}
                        >
                          {isDeadlinePassed ? "Deadline Passed" : "Active"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Max Score: {formattedMaxScore} points
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Due: {format(new Date(homework.deadline), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{homework.description}</p>
                </div>
              </CardContent>
              {homework.attachment_path && (
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Attachment included</span>
                    </div>
                    <a
                      href={`/admin/all/homework/${homework.id}/download`}
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-25 transition"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>
                  {submissionStats.total} total submissions: {submissionStats.pending} pending, {submissionStats.approved} approved, {submissionStats.denied} denied
                </CardDescription>
              </CardHeader>
              <CardContent>
                {homework.submissions && homework.submissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {homework.submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.user.name}</TableCell>
                          <TableCell>{format(new Date(submission.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            {submission.status === "pending" && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>
                            )}
                            {submission.status === "approved" && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
                            )}
                            {submission.status === "denied" && (
                              <Badge variant="outline" className="bg-red-50 text-red-700">Denied</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = route("admin.courses.homework.submissions.show", [course.id, homework.id, submission.id])}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course</h3>
                  <p>
                    <Link
                      href={route("admin.courses.show", course.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {course.title}
                    </Link>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{format(new Date(homework.deadline), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Maximum Score</h3>
                  <p>{formattedMaxScore} points</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{format(new Date(homework.created_at), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Statistics</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-50 rounded-md p-2 text-center">
                      <div className="text-sm font-medium">{submissionStats.total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-yellow-50 rounded-md p-2 text-center">
                      <div className="text-sm font-medium text-yellow-700">{submissionStats.pending}</div>
                      <div className="text-xs text-yellow-500">Pending</div>
                    </div>
                    <div className="bg-green-50 rounded-md p-2 text-center">
                      <div className="text-sm font-medium text-green-700">{submissionStats.approved}</div>
                      <div className="text-xs text-green-500">Approved</div>
                    </div>
                    <div className="bg-red-50 rounded-md p-2 text-center">
                      <div className="text-sm font-medium text-red-700">{submissionStats.denied}</div>
                      <div className="text-xs text-red-500">Denied</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 