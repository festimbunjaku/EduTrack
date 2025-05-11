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
import { ArrowLeft, Edit, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

interface Course {
  id: number;
  title: string;
  teacher: {
    id: number;
    name: string;
  };
}

interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course: Course;
}

interface ShowProps extends PageProps {
  room: Room;
  schedules: Schedule[];
}

export default function Show({ auth, room, schedules }: ShowProps) {
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
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const schedulesByDay = days.map(day => ({
    day,
    schedules: schedules.filter(schedule => schedule.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }));

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Room: ${room.name}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <div className="flex gap-2">
            <Link href={route("admin.rooms.edit", { room: room.id })}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Room
              </Button>
            </Link>
            <Link href={route("admin.rooms.index")}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-sm">{room.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="mt-1 text-sm">{room.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Capacity</dt>
                  <dd className="mt-1 text-sm">{room.capacity} students</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={room.is_active ? "default" : "secondary"}>
                      {room.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Current schedule for this room</CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-muted-foreground">No classes scheduled in this room.</p>
              ) : (
                <div className="space-y-6">
                  {schedulesByDay.map(({ day, schedules }) => (
                    <div key={day} className={schedules.length === 0 ? "hidden" : "space-y-3"}>
                      <h3 className="text-lg font-medium flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> {formatDay(day)}
                      </h3>
                      <div className="space-y-2">
                        {schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="border rounded-md p-3 bg-muted/30"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{schedule.course.title}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Teacher: {schedule.course.teacher ? schedule.course.teacher.name : 'Not assigned'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 