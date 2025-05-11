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
import { ArrowLeft, Clock } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course: {
    id: number;
    title: string;
    teacher: {
      id: number;
      name: string;
    };
  };
}

interface RoomWithSchedules {
  room: Room;
  schedules: Schedule[];
}

interface TimetableProps extends PageProps {
  timetables: Record<string, RoomWithSchedules>;
}

export default function Timetable({ auth, timetables }: TimetableProps) {
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

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Rooms Timetable" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rooms Timetable</h1>
          <Link href={route("admin.rooms.index")}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
            </Button>
          </Link>
        </div>

        <Tabs defaultValue={days[0]}>
          <TabsList className="grid grid-cols-7 mb-4">
            {days.map((day) => (
              <TabsTrigger key={day} value={day}>
                {formatDay(day)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {days.map((day) => (
            <TabsContent key={day} value={day} className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">{formatDay(day)} Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(timetables).map(({ room, schedules }) => {
                  const daySchedules = schedules.filter(
                    (schedule) => schedule.day_of_week === day
                  );
                  
                  return (
                    <Card key={room.id}>
                      <CardHeader>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>{room.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {daySchedules.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No classes scheduled
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {daySchedules
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="border rounded-md p-3 bg-muted/30"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">
                                      {schedule.course.title}
                                    </h3>
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
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppSidebarLayout>
  );
} 