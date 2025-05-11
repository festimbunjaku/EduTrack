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
import { Trash, PencilLine, Eye, Plus, AlertTriangle, Book, FileText, Award } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Improved course action links for materials, homework, and certificates
  const renderCourseActionLinks = (course: Course) => {
    return (
      <div className="flex items-center justify-end space-x-1">
        <Link href={route("admin.courses.show", course.id)}>
          <Button
            size="icon"
            variant="ghost"
            title="View course details"
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
        
        {/* Dedicated buttons for materials, homework and certificates */}
        <Link href={route("admin.courses.materials.index", course.id)}>
          <Button
            size="icon"
            variant="ghost"
            title="Course materials"
          >
            <Book className="h-4 w-4 text-blue-500" />
          </Button>
        </Link>
        
        <Link href={route("admin.courses.homework.index", course.id)}>
          <Button
            size="icon"
            variant="ghost"
            title="Course homework"
          >
            <FileText className="h-4 w-4 text-green-500" />
          </Button>
        </Link>
        
        <Link href={route("admin.courses.certificates.index", course.id)}>
          <Button
            size="icon"
            variant="ghost"
            title="Course certificates"
          >
            <Award className="h-4 w-4 text-amber-500" />
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
      </div>
    );
  };

  // Improved CourseCard component for reuse
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={getStatusBadgeColor(course.status)}>
            {statuses?.[course.status] || course.status}
          </Badge>
        </div>
        <CardTitle className="mt-2">{course.title}</CardTitle>
        <p className="text-sm text-gray-500">
          {course.teacher ? `Taught by ${course.teacher.name}` : 'No teacher assigned'}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-gray-500">Start Date:</span>
            <p>{format(new Date(course.start_date), "MMM d, yyyy")}</p>
          </div>
          <div>
            <span className="text-gray-500">Enrollment:</span>
            <p>{course.enrollments_count}/{course.max_enrollment}</p>
          </div>
        </div>
      </CardContent>
      <div className="p-4 border-t">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link href={route("admin.courses.materials.index", course.id)} className="w-full">
            <Button variant="outline" className="w-full flex flex-col h-auto py-3 px-2">
              <Book className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs">Materials</span>
            </Button>
          </Link>
          <Link href={route("admin.courses.homework.index", course.id)} className="w-full">
            <Button variant="outline" className="w-full flex flex-col h-auto py-3 px-2">
              <FileText className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-xs">Homework</span>
            </Button>
          </Link>
          <Link href={route("admin.courses.certificates.index", course.id)} className="w-full">
            <Button variant="outline" className="w-full flex flex-col h-auto py-3 px-2">
              <Award className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-xs">Certificates</span>
            </Button>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <Link href={route("admin.courses.show", course.id)}>
            <Button size="sm" variant="secondary">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          <div className="flex space-x-1">
            <Link href={route("admin.courses.edit", course.id)}>
              <Button size="icon" variant="ghost">
                <PencilLine className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(course)}>
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

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
        <PageHeader
          title="Courses"
          description="Manage all courses, enrollment status, and teacher assignments"
          actions={
            <Link href={route("admin.courses.create")}>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Course
              </Button>
            </Link>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              View and manage all courses in the system
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
                    {statuses && Object.entries(statuses).map(([value, label]) => (
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

            <Tabs defaultValue="table" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
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
                                {statuses?.[course.status] || course.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {course.enrollments_count}/{course.max_enrollment}
                            </TableCell>
                            <TableCell className="text-right">
                              {renderCourseActionLinks(course)}
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
              </TabsContent>
              
              <TabsContent value="grid">
                {courses.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.data.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                    No courses found
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <Pagination links={courses.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 