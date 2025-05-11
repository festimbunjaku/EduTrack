import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Home, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  title: string;
  teacher: {
    id: number;
    name: string;
  };
}

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

interface TimetableProps extends PageProps {
  course: Course;
  timetable: Schedule[];
}

export default function Timetable({ auth, course, timetable }: TimetableProps) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

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
  const scheduleByDay = days.map((day) => {
    return {
      day,
      schedules: timetable.filter((schedule) => schedule.day_of_week === day),
    };
  });

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`${course.title} - Timetable`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Course Timetable</h1>
          <div className="flex gap-2">
            <Link href={route("admin.courses.edit", { course: course.id })}>
              <Button variant="outline">
                <FileEdit className="mr-2 h-4 w-4" /> Edit Course
              </Button>
            </Link>
            <Link href={route("admin.courses.index")}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>
              Teacher: {course.teacher.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {scheduleByDay.map(({ day, schedules }) => (
                <div key={day} className="space-y-3">
                  <h2 className="text-xl font-semibold">{formatDay(day)}</h2>
                  
                  {schedules.length === 0 ? (
                    <p className="text-muted-foreground">No classes scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {schedules
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="border rounded-md p-4 bg-muted/30"
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
                                  <span>
                                    {schedule.room.name} ({schedule.room.location})
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline">Scheduled</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 