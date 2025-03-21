import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, User } from "@/types";
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
import { Trash, PencilLine, Eye, Plus, AlertTriangle } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoursesData {
  data: Course[];
  links: any[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

interface IndexProps extends PageProps {
  courses: CoursesData;
  teachers: User[];
  filters: {
    search: string;
    status: string;
    teacher_id: number;
    sort_field: string;
    sort_direction: string;
  };
  statuses: Record<string, string>;
}

export default function Index({
  auth,
  courses,
  teachers,
  filters,
  statuses,
}: IndexProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get the view parameter from the URL to handle special views
  const { url } = usePage();
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const viewMode = urlParams.get('view');
  
  // Define getStatusBadgeColor function before it's used
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Function to navigate to the specific view for a course
  const navigateToCourseView = (courseId: number) => {
    if (viewMode === 'materials') {
      router.visit(route('admin.courses.materials.index', { course: courseId }));
    } else if (viewMode === 'homework') {
      router.visit(route('admin.courses.homework.index', { course: courseId }));
    } else if (viewMode === 'certificates') {
      router.visit(route('admin.courses.certificates.index', { course: courseId }));
    }
  };
  
  // If we have a specific view mode, show a different UI for course selection
  if (viewMode && ['materials', 'homework', 'certificates'].includes(viewMode)) {
    const viewTitles = {
      'materials': 'Course Materials',
      'homework': 'Course Homework',
      'certificates': 'Course Certificates'
    };
    
    return (
      <AppSidebarLayout user={auth.user}>
        <Head title={viewTitles[viewMode as keyof typeof viewTitles]} />
        
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{viewTitles[viewMode as keyof typeof viewTitles]}</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Select a Course</CardTitle>
              <CardDescription>
                Choose a course to manage its {viewMode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.data.length > 0 ? (
                  courses.data.map((course) => (
                    <div 
                      key={course.id}
                      className="flex justify-between items-center p-4 border rounded-md bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => navigateToCourseView(course.id)}
                    >
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          {course.teacher ? `Taught by ${course.teacher.name}` : 'No teacher assigned'}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(course.status)}>
                        {statuses[course.status]}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-2" />
                        Select
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No courses available</p>
                    <Link href={route("admin.courses.create")}>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Course
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppSidebarLayout>
    );
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      route("admin.courses.index"),
      { search },
      { preserveState: true, replace: true }
    );
  };

  const handleStatusChange = (status: string) => {
    router.get(
      route("admin.courses.index"),
      { ...filters, status: status === "all" ? "" : status },
      { preserveState: true, replace: true }
    );
  };

  const handleTeacherChange = (teacherId: string) => {
    router.get(
      route("admin.courses.index"),
      { ...filters, teacher_id: teacherId === "all" ? "" : teacherId },
      { preserveState: true, replace: true }
    );
  };

  const handleSort = (field: string) => {
    const direction =
      filters.sort_field === field && filters.sort_direction === "asc"
        ? "desc"
        : "asc";
    router.get(
      route("admin.courses.index"),
      { ...filters, sort_field: field, sort_direction: direction },
      { preserveState: true, replace: true }
    );
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
  };

  const closeDeleteDialog = () => {
    setCourseToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    router.delete(route("admin.courses.destroy", courseToDelete.id), {
      onSuccess: () => {
        closeDeleteDialog();
      },
      onError: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Courses" />

      <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete '{courseToDelete?.title}'? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Courses</h1>
          <Link href={route("admin.courses.create")}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Course
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Manage all courses, enrollment status, and teacher assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search courses..."
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
                  value={filters.teacher_id ? filters.teacher_id.toString() : "all"}
                  onValueChange={handleTeacherChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
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
                      onClick={() => handleSort("title")}
                    >
                      Title
                      {filters.sort_field === "title" && (
                        <span className="ml-1">
                          {filters.sort_direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("start_date")}
                    >
                      Start Date
                      {filters.sort_field === "start_date" && (
                        <span className="ml-1">
                          {filters.sort_direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.data.length > 0 ? (
                    courses.data.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell>{course.teacher?.name}</TableCell>
                        <TableCell>
                          {format(new Date(course.start_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(course.status)}
                            variant="outline"
                          >
                            {statuses[course.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {course.enrollments_count}/{course.max_enrollment}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link href={route("admin.courses.show", course.id)}>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="View course"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={route("admin.courses.edit", course.id)}>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit course"
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDeleteDialog(course)}
                            title="Delete course"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination links={courses.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 