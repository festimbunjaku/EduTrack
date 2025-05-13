import { Head, Link, router } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, User } from "@/types";
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
  Calendar,
  Clock, 
  Coins, 
  Edit, 
  MapPin, 
  Users,
  ChevronLeft,
  Star,
  Clipboard,
  BookOpen,
  Trash2,
  AlertTriangle,
  FileText,
  Award,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface Room {
  id: number;
  name: string;
  location: string;
}

interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course_id: number;
  room_id: number;
  room: Room;
}

interface ShowProps extends PageProps {
  course: Course & {
    approved_enrollments_count: number;
    pending_enrollments_count: number;
    waitlisted_enrollments_count: number;
  };
  timetable: Schedule[];
}

export default function Show({ auth, course, timetable }: ShowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatSchedule = (schedule: any[]) => {
    if (!Array.isArray(schedule)) return "No schedule available";
    
    return schedule.map((item) => {
      const day = item.day.charAt(0).toUpperCase() + item.day.slice(1);
      return `${day}: ${item.start_time} - ${item.end_time}`;
    }).join(', ');
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Group schedules by day
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const scheduleByDay = days.map((day) => {
    return {
      day,
      schedules: timetable?.filter((schedule) => schedule.day_of_week === day) || [],
    };
  });

  const handleDelete = () => {
    setIsDeleting(true);
    router.delete(route('admin.courses.destroy', course.id), {
      onSuccess: () => {
        // Dialog will automatically close as component unmounts on successful deletion
      },
      onError: () => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Course: ${course.title}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('admin.courses.index')}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <Badge
              className={getStatusBadgeColor(course.status)}
              variant="outline"
            >
              {getStatusLabel(course.status)}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Link href={route("admin.courses.edit", course.id)}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Course
              </Button>
            </Link>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Course
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete '{course.title}'? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Full information about this course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course image */}
                {course.image && (
                  <div className="rounded-md overflow-hidden h-48 bg-gray-100">
                    <img 
                      src={`/storage/${course.image}`} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{course.description}</p>
                </div>

                {/* Timetable Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Course Schedule</h3>
                  
                  {timetable && timetable.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scheduleByDay.map(({ day, schedules }) => (
                        <Card key={day} className={schedules.length === 0 ? "opacity-60" : ""}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-md">{formatDay(day)}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {schedules.length === 0 ? (
                              <p className="text-muted-foreground text-sm">No classes scheduled</p>
                            ) : (
                              <div className="space-y-3">
                                {schedules
                                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                  .map((schedule) => (
                                    <div
                                      key={schedule.id}
                                      className="border rounded-md p-3 bg-muted/30"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="flex items-center mb-2">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span className="font-medium">
                                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                            </span>
                                          </div>
                                          <div className="flex items-center">
                                            <Home className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                              {schedule.room.name} ({schedule.room.location})
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                      <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <h4 className="text-lg font-medium">No Schedule</h4>
                      <p className="text-muted-foreground">This course doesn't have a schedule set yet.</p>
                      <Link href={route("admin.courses.timetable-options", course.id)}>
                        <Button variant="outline" className="mt-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          Set Schedule
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Course features */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>{course.feature_1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>{course.feature_2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>{course.feature_3}</span>
                    </li>
                  </ul>
                </div>

                {/* Course schedule */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Schedule</h3>
                  <div className="space-y-3">
                    {Array.isArray(course.schedule) && course.schedule.length > 0 ? (
                      course.schedule.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span>
                            {item.day.charAt(0).toUpperCase() + item.day.slice(1)}: {item.start_time} - {item.end_time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No schedule information available</p>
                    )}
                  </div>
                </div>

                {/* Teacher info */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Teacher</h3>
                  {course.teacher ? (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                        {course.teacher.avatar ? (
                          <img 
                            src={`/storage/${course.teacher.avatar}`} 
                            alt={course.teacher.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          course.teacher.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{course.teacher.name}</div>
                        <div className="text-sm text-gray-500">{course.teacher.email}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No teacher assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Materials & Homework */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(course.materials) && course.materials.length > 0 ? (
                    <div className="space-y-2">
                      {course.materials.slice(0, 3).map((material: any) => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="truncate">{material.title}</div>
                          <Link href={route("admin.courses.materials.show", {
                            course: course.id,
                            material: material.id,
                          })}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {course.materials.length > 3 && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                          +{course.materials.length - 3} more materials
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No materials available</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={route("admin.courses.materials.index", course.id)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Materials
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Homework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(course.homeworks) && course.homeworks.length > 0 ? (
                    <div className="space-y-2">
                      {course.homeworks.slice(0, 3).map((homework: any) => (
                        <div key={homework.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="truncate">{homework.title}</div>
                          <Link href={route("admin.courses.homework.show", {
                            course: course.id,
                            homework: homework.id,
                          })}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {course.homeworks.length > 3 && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                          +{course.homeworks.length - 3} more assignments
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No homework assignments</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={route("admin.courses.homework.index", course.id)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Homework
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(course.certificates) && course.certificates?.length > 0 ? (
                    <div className="space-y-2">
                      {course.certificates.slice(0, 3).map((certificate: any) => (
                        <div key={certificate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="truncate">{certificate.user?.name}</div>
                          <Link href={route("admin.courses.certificates.show", {
                            course: course.id,
                            certificate: certificate.id,
                          })}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {course.certificates.length > 3 && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                          +{course.certificates.length - 3} more certificates
                        </div>
                      )}
                    </div>
                  ) : (
                    course.status === 'completed' ? (
                      <p className="text-gray-500">No certificates issued yet</p>
                    ) : (
                      <p className="text-gray-500">Course must be completed to issue certificates</p>
                    )
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={route("admin.courses.certificates.index", course.id)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Certificates
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Course Dates</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(course.start_date), "MMMM d, yyyy")} - {format(new Date(course.end_date), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm text-gray-500">{course.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Price</div>
                    <div className="text-sm text-gray-500">${course.price}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Enrollment</div>
                    <div className="text-sm text-gray-500">
                      {course.approved_enrollments_count} / {course.max_enrollment} students enrolled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approved</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {course.approved_enrollments_count}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {course.pending_enrollments_count}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Waitlisted</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {course.waitlisted_enrollments_count}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available Spots</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {Math.max(0, course.max_enrollment - course.approved_enrollments_count)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  View Enrollments
                </Button>
                <Link href={route("admin.courses.materials.create", course.id)}>
                  <Button className="w-full" variant="outline">
                    Add Material
                  </Button>
                </Link>
                <Link href={route("admin.courses.materials.index", course.id)}>
                  <Button className="w-full" variant="outline">
                    Manage Materials
                  </Button>
                </Link>
                <Link href={route("admin.courses.homework.create", course.id)}>
                  <Button className="w-full" variant="outline">
                    Add Homework
                  </Button>
                </Link>
                <Link href={route("admin.courses.homework.index", course.id)}>
                  <Button className="w-full" variant="outline">
                    Manage Homework
                  </Button>
                </Link>
                <Link href={route("admin.courses.certificates.index", course.id)}>
                  <Button className="w-full" variant="outline">
                    Manage Certificates
                  </Button>
                </Link>
                {course.status === "completed" && (
                  <Link href={route("admin.courses.certificates.create", course.id)}>
                    <Button className="w-full" variant="outline">
                      Issue Certificate
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 