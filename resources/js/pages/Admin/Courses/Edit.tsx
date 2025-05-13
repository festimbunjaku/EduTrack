import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState, useEffect } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, User, Course } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, XCircle, RefreshCw, X, Clock, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
}

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

interface RoomScheduleItem {
  id?: number;
  day: string;
  room_id: string;
  start_time: string;
  end_time: string;
}

interface EditProps extends PageProps {
  teachers: User[];
  statuses: Record<string, string>;
  course: Course;
  rooms: Room[];
  roomSchedules: RoomScheduleItem[];
}

export default function Edit({ auth, teachers, statuses, course, rooms, roomSchedules }: EditProps) {
  // Use Inertia's useForm hook with pre-filled data
  const { data, setData, put, processing, errors } = useForm({
    title: course.title || "",
    description: course.description || "",
    feature_1: course.feature_1 || "",
    feature_2: course.feature_2 || "",
    feature_3: course.feature_3 || "",
    price: course.price?.toString() || "",
    location: course.location || "",
    start_date: course.start_date ? new Date(course.start_date).toISOString().split('T')[0] : "",
    end_date: course.end_date ? new Date(course.end_date).toISOString().split('T')[0] : "",
    schedule: course.schedule ? course.schedule : {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    room_schedules: roomSchedules || [],
    teacher_id: course.teacher_id?.toString() || "",
    max_enrollment: course.max_enrollment?.toString() || "20",
    status: course.status || "upcoming",
    scheduling_mode: "manual", // Default to manual for editing
  });

  // For adding schedule items
  const [newScheduleDay, setNewScheduleDay] = useState("");
  const [newScheduleStartTime, setNewScheduleStartTime] = useState("");
  const [newScheduleEndTime, setNewScheduleEndTime] = useState("");
  const [newScheduleRoomId, setNewScheduleRoomId] = useState("");
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false);
  const [timetablePreview, setTimetablePreview] = useState<Array<{
    day: string;
    room_id: string;
    room_name?: string;
    start_time: string;
    end_time: string;
  }>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(name as any, value);
  };

  const handleScheduleDayChange = (day: string) => {
    setData('schedule', {
      ...data.schedule,
      [day]: !data.schedule[day]
    });
  };

  const handleSchedulingModeChange = (value: string) => {
    setData('scheduling_mode', value);
  };

  const handleAddScheduleItem = () => {
    if (newScheduleDay && newScheduleStartTime && newScheduleEndTime) {
      // Update schedule to include this day
      setData('schedule', {
        ...data.schedule,
        [newScheduleDay]: true
      });
      
      // Add to room_schedules if we're in manual mode
      const newRoomSchedule = {
        day: newScheduleDay,
        room_id: newScheduleRoomId && newScheduleRoomId !== 'none' ? newScheduleRoomId : '',
        start_time: newScheduleStartTime,
        end_time: newScheduleEndTime,
      };
      
      setData('room_schedules', [...data.room_schedules, newRoomSchedule]);
      
      // Reset inputs
      setNewScheduleDay("");
      setNewScheduleStartTime("");
      setNewScheduleEndTime("");
      setNewScheduleRoomId("");
    }
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updatedRoomSchedules = [...data.room_schedules];
    updatedRoomSchedules.splice(index, 1);
    setData('room_schedules', updatedRoomSchedules);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    put(route('admin.courses.update', course.id));
  };
  
  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time; // Return original if format is unexpected
    }
  };

  // Initialize days with existing room schedules
  useEffect(() => {
    // Create a copy of the schedule object
    const updatedSchedule = { ...data.schedule };
    
    // Mark all days that have room schedules as selected
    data.room_schedules.forEach(schedule => {
      updatedSchedule[schedule.day] = true;
    });
    
    // Update the schedule state
    setData('schedule', updatedSchedule);
  }, []);
  
  // Group room schedules by day for better display
  const getSchedulesByDay = () => {
    const schedulesByDay = days.map(day => ({
      day: day.value,
      label: day.label,
      schedules: data.room_schedules.filter(schedule => schedule.day === day.value)
    }));
    
    return schedulesByDay;
  };

  // Days of the week options
  const days = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Edit Course" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={route('admin.courses.timetable', { course: course.id })}>
                <Clock className="mr-2 h-4 w-4" /> View Timetable
              </a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Update course information by editing the fields below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    placeholder="Introduction to Programming"
                    required
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the course"
                    required
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature_1">Feature 1</Label>
                    <Input
                      id="feature_1"
                      name="feature_1"
                      value={data.feature_1}
                      onChange={handleChange}
                      placeholder="Feature 1"
                      required
                    />
                    {errors.feature_1 && <p className="text-sm text-red-500">{errors.feature_1}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feature_2">Feature 2</Label>
                    <Input
                      id="feature_2"
                      name="feature_2"
                      value={data.feature_2}
                      onChange={handleChange}
                      placeholder="Feature 2"
                      required
                    />
                    {errors.feature_2 && <p className="text-sm text-red-500">{errors.feature_2}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feature_3">Feature 3</Label>
                    <Input
                      id="feature_3"
                      name="feature_3"
                      value={data.feature_3}
                      onChange={handleChange}
                      placeholder="Feature 3"
                      required
                    />
                    {errors.feature_3 && <p className="text-sm text-red-500">{errors.feature_3}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        id="price"
                        name="price"
                        value={data.price}
                        onChange={handleChange}
                        className="pl-8"
                        placeholder="99.99"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={data.location}
                      onChange={handleChange}
                      placeholder="Course location"
                      required
                    />
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      value={data.start_date}
                      onChange={handleChange}
                      type="date"
                      required
                    />
                    {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      value={data.end_date}
                      onChange={handleChange}
                      type="date"
                      required
                    />
                    {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md bg-muted/30 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Class Days & Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Edit which days the course will have classes and the schedule for each day
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {days.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day.value}`}
                            checked={data.schedule[day.value]}
                            onCheckedChange={() => handleScheduleDayChange(day.value)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.schedule && <p className="text-sm text-red-500">{errors.schedule}</p>}
                  </div>

                  <div className="my-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Timetable Editor</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="new-day">Day</Label>
                        <Select 
                          value={newScheduleDay} 
                          onValueChange={setNewScheduleDay}
                        >
                          <SelectTrigger id="new-day">
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-room">Room</Label>
                        <Select 
                          value={newScheduleRoomId} 
                          onValueChange={setNewScheduleRoomId}
                        >
                          <SelectTrigger id="new-room">
                            <SelectValue placeholder="Select Room" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">To be assigned</SelectItem>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id.toString()}>
                                {room.name} ({room.capacity} seats)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-start-time">Start Time</Label>
                        <Input
                          id="new-start-time"
                          type="time"
                          value={newScheduleStartTime}
                          onChange={(e) => setNewScheduleStartTime(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-end-time">End Time</Label>
                        <Input
                          id="new-end-time"
                          type="time"
                          value={newScheduleEndTime}
                          onChange={(e) => setNewScheduleEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddScheduleItem}
                        disabled={!newScheduleDay || !newScheduleStartTime || !newScheduleEndTime}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />Add Schedule Item
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Current Timetable</h3>
                      {data.room_schedules.length === 0 ? (
                        <div className="rounded-md p-4 border border-dashed text-center">
                          <p className="text-muted-foreground">No schedule items added yet</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Add schedule items using the form above
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {getSchedulesByDay()
                            .filter(dayGroup => dayGroup.schedules.length > 0)
                            .map((dayGroup) => (
                              <div key={dayGroup.day} className="space-y-3">
                                <h4 className="font-medium">{dayGroup.label}</h4>
                                
                                <div className="space-y-2">
                                  {dayGroup.schedules
                                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                    .map((item, index) => {
                                      const roomName = rooms.find(r => r.id.toString() === item.room_id)?.name;
                                      
                                      return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                                          <div>
                                            <span className="text-muted-foreground mr-2">
                                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                            </span>
                                            
                                            {item.room_id && roomName && (
                                              <span>
                                                | Room: {roomName}
                                              </span>
                                            )}
                                            
                                            {!item.room_id && (
                                              <span className="text-muted-foreground">
                                                | Room: To be assigned
                                              </span>
                                            )}
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveScheduleItem(index)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id">Teacher</Label>
                    <Select 
                      value={data.teacher_id} 
                      onValueChange={(value) => setData('teacher_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.teacher_id && <p className="text-sm text-red-500">{errors.teacher_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_enrollment">Max Enrollment</Label>
                    <Input
                      id="max_enrollment"
                      name="max_enrollment"
                      value={data.max_enrollment}
                      onChange={handleChange}
                      type="number"
                      min="1"
                      max="20"
                      required
                    />
                    {errors.max_enrollment && <p className="text-sm text-red-500">{errors.max_enrollment}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={data.status} 
                      onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses && Object.entries(statuses || {}).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 