import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState, useEffect } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, User } from "@/types";
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
import { PlusCircle, XCircle, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

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
  day: string;
  room_id: string;
  start_time: string;
  end_time: string;
}

interface CreateProps extends PageProps {
  teachers: User[];
  statuses: Record<string, string>;
  rooms: Room[];
}

export default function Create({ auth, teachers, statuses, rooms }: CreateProps) {
  // Use Inertia's useForm hook instead of local state
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    description: "",
    feature_1: "",
    feature_2: "",
    feature_3: "",
    price: "",
    location: "",
    start_date: "",
    end_date: "",
    schedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    room_schedules: [] as RoomScheduleItem[],
    teacher_id: "",
    max_enrollment: "20",
    status: "upcoming",
    scheduling_mode: "automatic", // "automatic" or "manual"
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
      
      // If room is selected, add to room_schedules as well
      if (data.scheduling_mode === 'manual') {
        const newRoomSchedule = {
          day: newScheduleDay,
          room_id: newScheduleRoomId && newScheduleRoomId !== 'none' ? newScheduleRoomId : '',
          start_time: newScheduleStartTime,
          end_time: newScheduleEndTime,
        };
        
        setData('room_schedules', [...data.room_schedules, newRoomSchedule]);
      }
      
      // Reset inputs
      setNewScheduleDay("");
      setNewScheduleStartTime("");
      setNewScheduleEndTime("");
      setNewScheduleRoomId("");
      
      // If we're in automatic mode, refresh the timetable preview
      if (data.scheduling_mode === 'automatic') {
        generateTimetablePreview();
      }
    }
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updatedRoomSchedules = [...data.room_schedules];
    updatedRoomSchedules.splice(index, 1);
    setData('room_schedules', updatedRoomSchedules);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin.courses.store'));
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

  const generateTimetablePreview = () => {
    // Get selected days from schedule
    const selectedDays = Object.entries(data.schedule)
      .filter(([day, selected]) => selected)
      .map(([day]) => day);
    
    if (selectedDays.length === 0) {
      alert("Please select at least one day in the Class Days section");
      return;
    }
    
    setIsGeneratingTimetable(true);
    
    // Use the TimetableService logic to generate a preview
    // This simulates what would happen after submission
    const preview: Array<{
      day: string;
      room_id: string;
      room_name?: string;
      start_time: string;
      end_time: string;
    }> = [];
    
    // Common time slots based on TimetableService.getAllTimeSlots()
    const timeSlots = [
      ['09:00', '10:30'],
      ['10:45', '12:15'],
      ['12:30', '14:00'],
      ['14:15', '15:45'],
      ['16:00', '17:30'],
      ['17:45', '19:15'],
      ['18:30', '20:00'],
    ];
    
    // Generate a schedule for each selected day
    let usedRooms = new Set<string>();
    let usedTimeSlots = new Set<string>();
    
    selectedDays.forEach(day => {
      // Find an available room and time slot
      // This is a simplified version of what the backend would do
      let assigned = false;
      
      // Try to distribute across different time slots first
      for (const [startTime, endTime] of timeSlots) {
        if (assigned) break;
        
        const timeSlotKey = `${startTime}-${endTime}`;
        if (usedTimeSlots.has(timeSlotKey)) continue;
        
        // Find a room that we haven't used yet if possible
        for (const room of rooms) {
          if (!usedRooms.has(room.id.toString())) {
            preview.push({
              day,
              room_id: room.id.toString(),
              room_name: room.name,
              start_time: startTime,
              end_time: endTime
            });
            usedRooms.add(room.id.toString());
            usedTimeSlots.add(timeSlotKey);
            assigned = true;
            break;
          }
        }
        
        // If we couldn't find an unused room, use any room
        if (!assigned) {
          const room = rooms[Math.floor(Math.random() * rooms.length)];
          preview.push({
            day,
            room_id: room.id.toString(),
            room_name: room.name,
            start_time: startTime,
            end_time: endTime
          });
          usedTimeSlots.add(timeSlotKey);
          assigned = true;
        }
      }
      
      // If we still couldn't assign (unlikely), use any combination
      if (!assigned) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const [startTime, endTime] = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        preview.push({
          day,
          room_id: room.id.toString(),
          room_name: room.name,
          start_time: startTime,
          end_time: endTime
        });
      }
    });
    
    // Sort by day
    preview.sort((a, b) => {
      const dayOrder = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
      return dayOrder[a.day] - dayOrder[b.day];
    });
    
    setTimetablePreview(preview);
    setIsGeneratingTimetable(false);
  };
  
  const refreshTimetable = () => {
    generateTimetablePreview();
  };
  
  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Automatically generate timetable preview when schedule changes
  useEffect(() => {
    if (data.scheduling_mode === 'automatic' && 
        Object.values(data.schedule).some(day => day)) {
      generateTimetablePreview();
    }
  }, [data.schedule, data.scheduling_mode]);

  // Group room schedules by day for the manual timetable view
  const getSchedulesByDay = () => {
    const schedulesByDay = days.map(day => ({
      day: day.value,
      label: day.label,
      schedules: data.room_schedules.filter(schedule => schedule.day === day.value)
    }));
    
    return schedulesByDay;
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Create Course" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create Course</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Create a new course by filling out the information below
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduling_mode">Scheduling Mode</Label>
                    <Select 
                      value={data.scheduling_mode} 
                      onValueChange={handleSchedulingModeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Scheduling Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic Scheduling</SelectItem>
                        <SelectItem value="manual">Manual Scheduling</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.scheduling_mode && <p className="text-sm text-red-500">{errors.scheduling_mode}</p>}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.scheduling_mode === 'automatic' 
                        ? "The system will automatically generate optimal timetable options based on room availability."
                        : "You'll create the schedule manually by specifying days, times, and rooms."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md bg-muted/30">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Class Days</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select which days the course will have classes
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
                    <h3 className="text-lg font-medium mb-4">
                      {data.scheduling_mode === 'automatic' 
                        ? "Automatic Timetable Preview" 
                        : "Schedule Builder"}
                    </h3>
                    
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
                          disabled={data.scheduling_mode === 'automatic'}
                        >
                          <SelectTrigger id="new-room">
                            <SelectValue placeholder={data.scheduling_mode === 'automatic' ? "Automatically assigned" : "Select Room"} />
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
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        {data.scheduling_mode === 'automatic' 
                          ? "Add Class Day" 
                          : "Add Schedule Item"}
                      </Button>
                      
                      {data.scheduling_mode === 'automatic' && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={refreshTimetable}
                          disabled={isGeneratingTimetable}
                          size="sm"
                        >
                          {isGeneratingTimetable ? (
                            <><svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>Generating...</>
                          ) : (
                            <><RefreshCw className="mr-2 h-4 w-4" /> Refresh Timetable</>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Timetable Preview/View */}
                    {data.scheduling_mode === 'automatic' ? (
                      // Automatic timetable preview
                      <>
                        <p className="text-sm text-muted-foreground mb-4">
                          This is a preview of the automatically generated timetable. After course creation, you will be able to select from multiple timetable options.
                        </p>
                        
                        {timetablePreview.length > 0 ? (
                          <div className="space-y-4">
                            {timetablePreview.map((item, index) => (
                              <div key={index} className="border rounded-md p-3 bg-background">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{formatDay(item.day)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Room: {item.room_name || `Room #${item.room_id}`}
                                    </p>
                                  </div>
                                  <div className="text-sm">
                                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : isGeneratingTimetable ? (
                          <div className="flex justify-center p-8">
                            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          <p className="text-center p-4 border border-dashed rounded-md">
                            Select course days to generate a timetable preview
                          </p>
                        )}
                        
                        <p className="text-sm mt-4 text-muted-foreground">
                          Note: This is just a preview. The final timetable will be optimized based on room availability when the course is created.
                        </p>
                      </>
                    ) : (
                      // Manual timetable view
                      <>
                        <p className="text-sm text-muted-foreground mb-4">
                          Manually created timetable. You can add or remove items as needed.
                        </p>
                        
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
                      </>
                    )}
                  </div>

                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Course'}
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