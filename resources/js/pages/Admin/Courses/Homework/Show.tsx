import { Head, Link, router } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Homework, HomeworkSubmission, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FileText,
  ChevronLeft,
  Pencil,
  Trash2,
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle,
  HelpCircle,
  UserCircle,
  Calendar,
  Clock,
  File,
} from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShowProps extends PageProps {
  course: Course;
  homework: Homework & {
    submissions: (HomeworkSubmission & {
      user: User;
    })[];
  };
  submissionStats: {
    total: number;
    pending: number;
    approved: number;
    denied: number;
  };
}

export default function Show({ auth, course, homework, submissionStats }: ShowProps) {
  const [reviewingSubmission, setReviewingSubmission] = useState<HomeworkSubmission | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "denied" | "pending">("pending");
  const [reviewComments, setReviewComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = () => {
    if (!reviewingSubmission) return;
    
    setIsSubmitting(true);
    
    router.post(
      route("admin.courses.homework.submissions.review", {
        course: course.id,
        homework: homework.id,
        submission: reviewingSubmission.id
      }),
      {
        status: reviewStatus,
        teacher_comments: reviewComments,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted successfully");
          setReviewingSubmission(null);
          setIsSubmitting(false);
        },
        onError: () => {
          toast.error("Failed to submit review");
          setIsSubmitting(false);
        },
      }
    );
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case "denied":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const openReviewDialog = (submission: HomeworkSubmission) => {
    setReviewingSubmission(submission);
    setReviewStatus(submission.status as "approved" | "denied" | "pending");
    setReviewComments(submission.teacher_comments || "");
  };

  const isDeadlinePassed = isPast(new Date(homework.deadline));

  const formatFileSize = (sizeInBytes: number | null | undefined) => {
    if (!sizeInBytes) return "Unknown size";
    const kb = sizeInBytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Homework: ${homework.title} - ${course.title}`} />

      <Dialog 
        open={!!reviewingSubmission} 
        onOpenChange={(open) => !open && setReviewingSubmission(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Review the student's work and provide feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  {reviewingSubmission?.user?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Submitted {reviewingSubmission && formatDistanceToNow(new Date(reviewingSubmission.created_at))} ago
                </span>
              </div>
            </div>

            {reviewingSubmission?.submission_file && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50 border">
                <FileText className="h-5 w-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">
                    {reviewingSubmission.submission_file.split('/').pop()}
                  </div>
                </div>
                <Link
                  href={reviewingSubmission.submission_file}
                  target="_blank"
                  className="shrink-0"
                >
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {reviewingSubmission?.comments && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Student Comments</Label>
                <div className="p-3 rounded-md bg-gray-50 border text-sm">
                  {reviewingSubmission.comments}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup
                id="status"
                value={reviewStatus}
                onValueChange={(value) => setReviewStatus(value as "approved" | "denied" | "pending")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved" className="flex items-center gap-1 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Approve
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="denied" id="denied" />
                  <Label htmlFor="denied" className="flex items-center gap-1 cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Needs Revision
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="flex items-center gap-1 cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    Pending
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher_comments">Feedback</Label>
              <Textarea
                id="teacher_comments"
                placeholder="Provide feedback to the student"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewingSubmission(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.homework.index", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Homework List
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Homework Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={route("admin.courses.homework.edit", {
                course: course.id,
                homework: homework.id,
              })}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link
              href={route("admin.courses.homework.destroy", {
                course: course.id,
                homework: homework.id,
              })}
              method="delete"
              as="button"
              className="focus:outline-none"
            >
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{homework.title}</CardTitle>
                    <CardDescription>
                      Homework assignment for {course.title}
                    </CardDescription>
                  </div>
                  {isDeadlinePassed ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Deadline Passed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {format(new Date(homework.deadline), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {isDeadlinePassed
                        ? `Closed ${formatDistanceToNow(new Date(homework.deadline))} ago`
                        : `Closes in ${formatDistanceToNow(new Date(homework.deadline))}`}
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="font-medium text-lg mb-2">Instructions</div>
                  <div className="whitespace-pre-wrap">{homework.description}</div>
                </div>

                {homework.attachment_path && (
                  <div className="mt-4">
                    <div className="font-medium text-lg mb-2">Attachment</div>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                      <File className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {homework.attachment_path.split('/').pop()}
                        </div>
                      </div>
                      <Link
                        href={route("admin.courses.homework.download", {
                          course: course.id,
                          homework: homework.id,
                        })}
                        className="shrink-0"
                      >
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    All
                    <span className="ml-1 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                      {submissionStats.total}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-1">
                    Pending
                    <span className="ml-1 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700">
                      {submissionStats.pending}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-1">
                    Approved
                    <span className="ml-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-700">
                      {submissionStats.approved}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="denied" className="flex items-center gap-1">
                    Needs Revision
                    <span className="ml-1 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-700">
                      {submissionStats.denied}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card>
                <CardContent className="p-0">
                  <TabsContent value="all" className="m-0">
                    <SubmissionsTable
                      submissions={homework.submissions}
                      onReview={openReviewDialog}
                    />
                  </TabsContent>
                  <TabsContent value="pending" className="m-0">
                    <SubmissionsTable
                      submissions={homework.submissions.filter(s => s.status === "pending")}
                      onReview={openReviewDialog}
                    />
                  </TabsContent>
                  <TabsContent value="approved" className="m-0">
                    <SubmissionsTable
                      submissions={homework.submissions.filter(s => s.status === "approved")}
                      onReview={openReviewDialog}
                    />
                  </TabsContent>
                  <TabsContent value="denied" className="m-0">
                    <SubmissionsTable
                      submissions={homework.submissions.filter(s => s.status === "denied")}
                      onReview={openReviewDialog}
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Total Submissions</span>
                      <span className="font-medium">{submissionStats.total}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: submissionStats.total > 0 ? "100%" : "0%",
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span>Approved</span>
                      </div>
                      <span className="font-medium">{submissionStats.approved}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: submissionStats.total > 0
                            ? `${(submissionStats.approved / submissionStats.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Pending</span>
                      </div>
                      <span className="font-medium">{submissionStats.pending}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: submissionStats.total > 0
                            ? `${(submissionStats.pending / submissionStats.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <span>Needs Revision</span>
                      </div>
                      <span className="font-medium">{submissionStats.denied}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: submissionStats.total > 0
                            ? `${(submissionStats.denied / submissionStats.total) * 100}%`
                            : "0%",
                        }}
                      />
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

interface SubmissionsTableProps {
  submissions: (HomeworkSubmission & { user: User })[];
  onReview: (submission: HomeworkSubmission) => void;
}

function SubmissionsTable({ submissions, onReview }: SubmissionsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case "denied":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className={cn("rounded-md", submissions.length === 0 ? "border" : "")}>
      {submissions.length > 0 ? (
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
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="font-medium">{submission.user.name}</div>
                  <div className="text-sm text-gray-500">{submission.user.email}</div>
                </TableCell>
                <TableCell>
                  <div>{format(new Date(submission.created_at), "MMM d, yyyy")}</div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(submission.created_at))} ago
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(submission.status)}
                    {getStatusBadge(submission.status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onReview(submission)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Review
                      </DropdownMenuItem>
                      {submission.submission_file && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={submission.submission_file}
                            target="_blank"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Submission
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500">
            There are no student submissions in this category
          </p>
        </div>
      )}
    </div>
  );
} 