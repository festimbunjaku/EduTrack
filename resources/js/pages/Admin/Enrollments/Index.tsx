import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Enrollment, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User as UserIcon, AlertTriangle, Eye, ClipboardList } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EnrollmentsData {
  data: Enrollment[];
  links: any[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

interface IndexProps extends PageProps {
  enrollments: EnrollmentsData;
  filters: {
    search: string;
    status: string;
    course_id: number;
    sort_field: string;
    sort_direction: string;
  };
  statuses: Record<string, string>;
  courses: { id: number; title: string }[];
}

export default function Index({
  auth,
  enrollments,
  filters,
  statuses,
  courses,
}: IndexProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "deny" | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "waitlisted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      route("admin.enrollments.index"),
      { search },
      { preserveState: true, replace: true }
    );
  };

  const handleStatusChange = (status: string) => {
    router.get(
      route("admin.enrollments.index"),
      { ...filters, status: status === "all" ? "" : status },
      { preserveState: true, replace: true }
    );
  };

  const handleCourseChange = (courseId: string) => {
    router.get(
      route("admin.enrollments.index"),
      { ...filters, course_id: courseId === "all" ? "" : courseId },
      { preserveState: true, replace: true }
    );
  };

  const handleSort = (field: string) => {
    const direction =
      filters.sort_field === field && filters.sort_direction === "asc"
        ? "desc"
        : "asc";
    router.get(
      route("admin.enrollments.index"),
      { ...filters, sort_field: field, sort_direction: direction },
      { preserveState: true, replace: true }
    );
  };

  const openActionDialog = (enrollment: Enrollment, action: "approve" | "deny") => {
    setSelectedEnrollment(enrollment);
    setActionType(action);
    setNotes("");
    setIsActionDialogOpen(true);
  };

  const closeActionDialog = () => {
    setSelectedEnrollment(null);
    setActionType(null);
    setNotes("");
    setIsActionDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleAction = () => {
    if (!selectedEnrollment || !actionType) return;
    
    setIsSubmitting(true);
    router.post(route(`admin.enrollments.${actionType}`, selectedEnrollment.id), {
      notes: notes,
    }, {
      onSuccess: () => {
        closeActionDialog();
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const getActionTitle = () => {
    if (actionType === "approve") {
      return "Approve Enrollment";
    } else if (actionType === "deny") {
      return "Deny Enrollment";
    }
    return "";
  };

  const getActionDescription = () => {
    const studentName = selectedEnrollment?.user?.name || "this student";
    const courseName = selectedEnrollment?.course?.title || "this course";

    if (actionType === "approve") {
      return `Are you sure you want to approve ${studentName}'s enrollment in ${courseName}?`;
    } else if (actionType === "deny") {
      return `Are you sure you want to deny ${studentName}'s enrollment in ${courseName}?`;
    }
    return "";
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Enrollment Management" />

      <Dialog open={isActionDialogOpen} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {getActionTitle()}
            </DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this enrollment decision..."
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeActionDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : actionType === "approve" ? 'Approve' : 'Deny'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Enrollment Management</h1>
          <Link href={route("admin.enrollments.history")}>
            <Button variant="outline" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              View Enrollment History
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Requests</CardTitle>
            <CardDescription>
              Review and manage student enrollment requests and waitlist positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">Search</Button>
                </form>
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.status ? filters.status : "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(statuses).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.course_id ? filters.course_id.toString() : "all"}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("created_at")}
                    >
                      Request Date
                      {filters.sort_field === "created_at" && (
                        <span className="ml-1">
                          {filters.sort_direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waitlist Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.data.length > 0 ? (
                    enrollments.data.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          {format(new Date(enrollment.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                            {enrollment.user?.name}
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.course?.title}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(enrollment.status)}
                            variant="outline"
                          >
                            {statuses[enrollment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enrollment.waitlist_position ?? '-'}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link href={route("admin.enrollments.show", enrollment.id)}>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="View enrollment details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {enrollment.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openActionDialog(enrollment, "approve")}
                                title="Approve enrollment"
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openActionDialog(enrollment, "deny")}
                                title="Deny enrollment"
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No enrollment requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination links={enrollments.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 