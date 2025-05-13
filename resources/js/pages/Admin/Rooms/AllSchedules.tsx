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
import { ArrowLeft, Calendar, Clock, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface Teacher {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
  teacher: Teacher;
}

interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course_id: number;
  room_id: number;
  course: Course;
}

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  schedules: Schedule[];
}

interface AllSchedulesProps extends PageProps {
  rooms: Room[];
  timeSlots: [string, string][];
  days: Record<string, string>;
}

export default function AllSchedules({ auth, rooms, timeSlots, days }: AllSchedulesProps) {
  const [selectedDay, setSelectedDay] = useState("monday");

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to find if there's a schedule at the given time and day for a room
  const findSchedule = (room: Room, day: string, startTime: string, endTime: string) => {
    return room.schedules.find(
      (s) =>
        s.day_of_week === day &&
        s.start_time === startTime &&
        s.end_time === endTime
    );
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="All Room Schedules" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Room Availability</h1>
          <div className="flex gap-2">
            <Link href={route("admin.rooms.index")}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Room Schedules</CardTitle>
            <CardDescription>
              View and manage all room schedules in one place
            </CardDescription>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(days).map(([day, label]) => (
                  <Button 
                    key={day} 
                    variant={selectedDay === day ? "default" : "outline"}
                    onClick={() => setSelectedDay(day)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border bg-muted/50 text-left min-w-[150px]">Room</th>
                    {timeSlots.map((slot, index) => (
                      <th key={index} className="p-2 border bg-muted/50 text-center">
                        {formatTime(slot[0])} - {formatTime(slot[1])}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="p-2 border">
                        <div className="font-medium">{room.name}</div>
                        <div className="text-xs text-muted-foreground">{room.location}</div>
                        <div className="text-xs text-muted-foreground">Capacity: {room.capacity}</div>
                      </td>
                      {timeSlots.map((slot, index) => {
                        const [startTime, endTime] = slot;
                        const schedule = findSchedule(room, selectedDay, startTime, endTime);
                        
                        return (
                          <td 
                            key={index} 
                            className={`p-2 border text-center ${
                              schedule ? "bg-red-50" : "bg-green-50"
                            }`}
                          >
                            {schedule ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="cursor-pointer">
                                      <Badge variant="destructive" className="whitespace-nowrap">
                                        Booked
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1 p-1">
                                      <p className="font-bold">{schedule.course.title}</p>
                                      <p className="text-xs">Teacher: {schedule.course.teacher.name}</p>
                                      <p className="text-xs">
                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                      </p>
                                      <Link 
                                        href={route("admin.courses.show", schedule.course_id)} 
                                        className="text-xs text-blue-500 hover:underline"
                                      >
                                        View Course
                                      </Link>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 whitespace-nowrap">
                                Available
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 