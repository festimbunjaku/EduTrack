import { Head, Link, useForm } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Clock,
  RefreshCw,
  Home,
  FileEdit,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface Teacher {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
  teacher: Teacher;
  status: string;
}

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

interface ScheduleSlot {
  day: string;
  room_id: number;
  room_name: string;
  start_time: string;
  end_time: string;
}

interface TimetableOption {
  id: number;
  course_id: number;
  schedule_data: ScheduleSlot[];
  utilization_score: number;
  option_number: number;
}

interface ConflictDetail {
  message: string;
  details: {
    course: string;
    teacher: string;
    time: string;
  };
  room_name?: string;
  day?: string;
  time?: string;
}

interface DetailedError {
  type: string;
  day: string;
  start_time?: string;
  end_time?: string;
  message: string;
}

interface TimetableOptionsProps extends PageProps {
  course: Course;
  options: TimetableOption[];
  rooms: Room[];
  days: Record<string, string>;
  timeSlots: Array<{
    start_time: string;
    end_time: string;
    label: string;
  }>;
  noOptionsAvailable?: boolean;
  error?: string;
  detailedErrors?: DetailedError[];
  roomConflicts?: ConflictDetail[];
  conflicts?: any[]; // For conflicts when applying a timetable option
}

export default function TimetableOptions({
  auth,
  course,
  options,
  rooms,
  days,
  timeSlots,
  noOptionsAvailable,
  error,
  detailedErrors = [],
  roomConflicts = [],
  conflicts = []
}: TimetableOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("automatic");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isManualScheduling, setIsManualScheduling] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const applyForm = useForm({
    option_id: "",
  });

  const manualForm = useForm({
    room_id: "",
    day_of_week: "",
    time_slot_index: "",
  });

  const regenerateForm = useForm();

  // Extract conflicts from flash message if they exist
  const conflictsFromFlash = (useForm().errors?.conflicts || []) as ConflictDetail[];

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string) => {
    // Parse time string (assuming format is HH:MM)
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));

    // Format to 12-hour clock
    return format(date, "h:mm a");
  };

  const handleApplyOption = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      alert("Please select a timetable option first");
      return;
    }
    
    console.log("Applying timetable option:", selectedOption);
    
    setIsApplying(true);
    applyForm.data.option_id = selectedOption.toString();
    applyForm.post(route("admin.courses.apply-timetable-option", { course: course.id }), {
      onSuccess: () => {
        console.log("Timetable option applied successfully");
        setIsApplying(false);
      },
      onError: (errors) => {
        console.error("Failed to apply timetable option:", errors);
        setIsApplying(false);
        alert("Failed to apply timetable option. Please try again.");
      }
    });
  };

  const handleManualSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualForm.data.room_id || !manualForm.data.day_of_week || !manualForm.data.time_slot_index) {
      alert("Please select a day, room, and time slot");
      return;
    }

    const selectedTimeSlot = timeSlots[parseInt(manualForm.data.time_slot_index)];
    console.log("Manual scheduling with data:", {
      room_id: manualForm.data.room_id,
      day_of_week: manualForm.data.day_of_week,
      start_time: selectedTimeSlot.start_time,
      end_time: selectedTimeSlot.end_time,
    });
    
    setIsManualScheduling(true);
    manualForm.post(route("admin.courses.manual-schedule", { course: course.id }), {
      data: {
        room_id: manualForm.data.room_id,
        day_of_week: manualForm.data.day_of_week,
        start_time: selectedTimeSlot.start_time,
        end_time: selectedTimeSlot.end_time,
      },
      onSuccess: () => {
        console.log("Manual schedule created successfully");
        setIsManualScheduling(false);
      },
      onError: (errors) => {
        console.error("Failed to create manual schedule:", errors);
        setIsManualScheduling(false);
      }
    });
  };

  const handleRegenerateOptions = () => {
    if (confirm("Are you sure you want to regenerate timetable options? This will delete all current options.")) {
      setIsRegenerating(true);
      regenerateForm.post(route("admin.courses.regenerate-timetable-options", { course: course.id }), {
        onSuccess: () => {
          console.log("Options regenerated successfully");
          setIsRegenerating(false);
        },
        onError: (errors) => {
          console.error("Failed to regenerate options:", errors);
          setIsRegenerating(false);
          alert("Failed to regenerate options. Please try again.");
        }
      });
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`${course.title} - Timetable Options`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Course Timetable Options</h1>
          <div className="flex gap-2">
            <Link href={route("admin.courses.timetable", { course: course.id })}>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" /> View Current Timetable
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
            {/* Show conflicts from applying a timetable option if they exist */}
            {conflicts && conflicts.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Scheduling Conflicts Detected</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">The timetable option could not be applied due to conflicts:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    {conflicts.slice(0, 5).map((conflict, index) => (
                      <li key={`apply-conflict-${index}`}>
                        {conflict.message || (
                          <>
                            <strong>{formatDay(conflict.day)}</strong> at {formatTime(conflict.start_time)} - {formatTime(conflict.end_time)}
                            {conflict.conflict_course && (
                              <div className="text-sm text-muted-foreground ml-4">
                                Conflicts with: {conflict.conflict_course} at {conflict.conflict_time}
                              </div>
                            )}
                          </>
                        )}
                        
                        {conflict.details && (
                          <div className="text-sm text-muted-foreground ml-4">
                            Already scheduled: {conflict.details.course} with {conflict.details.teacher}
                          </div>
                        )}
                      </li>
                    ))}
                    {conflicts.length > 5 && (
                      <li className="text-muted-foreground">
                        And {conflicts.length - 5} more conflicts...
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {noOptionsAvailable || options.length === 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Timetable Options Available</AlertTitle>
                <AlertDescription>
                  {error || "No valid timetable options could be generated based on room availability."}

                  {detailedErrors && detailedErrors.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Scheduling Conflicts:</h4>
                      <ul className="list-disc pl-4 space-y-2">
                        {detailedErrors.map((error, index) => (
                          <li key={`detail-error-${index}`}>
                            <strong>{formatDay(error.day)}</strong>: {error.message}
                            {error.start_time && error.end_time && (
                              <span className="block text-sm text-muted-foreground ml-4">
                                Time: {formatTime(error.start_time)} - {formatTime(error.end_time)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {roomConflicts && roomConflicts.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Room Conflicts:</h4>
                      <ul className="list-disc pl-4 space-y-2">
                        {roomConflicts.slice(0, 5).map((conflict, index) => (
                          <li key={`room-conflict-${index}`}>
                            <strong>{conflict.room_name}</strong> on {formatDay(conflict.day || '')} at {conflict.time}
                            <div className="text-sm text-muted-foreground ml-4">
                              Already scheduled: {conflict.details.course} with {conflict.details.teacher}
                            </div>
                          </li>
                        ))}
                        {roomConflicts.length > 5 && (
                          <li className="text-muted-foreground">
                            And {roomConflicts.length - 5} more conflicts...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button onClick={handleRegenerateOptions} variant="outline" size="sm" disabled={isRegenerating}>
                      {isRegenerating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" /> Try Regenerate Options
                        </>
                      )}
                    </Button>
                    
                    <Link href={route("admin.courses.edit", { course: course.id })}>
                      <Button variant="outline" size="sm" className="ml-2">
                        <FileEdit className="mr-2 h-4 w-4" /> Edit Course
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="automatic">Automatic Options</TabsTrigger>
                    <TabsTrigger value="manual">Manual Scheduling</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="automatic" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Select one of the automatically generated timetable options below
                      </p>
                      <Button onClick={handleRegenerateOptions} variant="outline" size="sm" disabled={isRegenerating}>
                        {isRegenerating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Options
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {options.map((option) => (
                        <Card key={option.id} className={`border-2 ${selectedOption === option.id ? 'border-primary' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>Option {option.option_number}</CardTitle>
                                <CardDescription>Optimization Score: {option.utilization_score.toFixed(1)}</CardDescription>
                              </div>
                              <Button 
                                variant={selectedOption === option.id ? "default" : "outline"}
                                onClick={() => setSelectedOption(option.id)}
                              >
                                {selectedOption === option.id ? (
                                  <>
                                    <Check className="mr-2 h-4 w-4" /> Selected
                                  </>
                                ) : (
                                  "Select"
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {option.schedule_data.map((slot, index) => (
                                <div key={index} className="border rounded-md p-3 bg-muted/30">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{formatDay(slot.day)}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Room: {slot.room_name}
                                      </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {selectedOption && (
                      <div className="flex justify-center pt-4">
                        <form onSubmit={handleApplyOption}>
                          <Button type="submit" size="lg" disabled={isApplying}>
                            {isApplying ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Applying...
                              </>
                            ) : (
                              "Apply Selected Timetable"
                            )}
                          </Button>
                        </form>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-4 mt-4">
                    <form onSubmit={handleManualSchedule} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="day_of_week">Day</Label>
                          <Select 
                            name="day_of_week" 
                            value={manualForm.data.day_of_week}
                            onValueChange={(value) => manualForm.setData("day_of_week", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Days</SelectLabel>
                                {Object.entries(days).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {manualForm.errors.day_of_week && (
                            <p className="text-destructive text-sm mt-1">{manualForm.errors.day_of_week}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="room_id">Room</Label>
                          <Select 
                            name="room_id"
                            value={manualForm.data.room_id}
                            onValueChange={(value) => manualForm.setData("room_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Rooms</SelectLabel>
                                {rooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id.toString()}>
                                    {room.name} ({room.location})
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {manualForm.errors.room_id && (
                            <p className="text-destructive text-sm mt-1">{manualForm.errors.room_id}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="time_slot">Time Slot</Label>
                          <Select 
                            name="time_slot_index"
                            value={manualForm.data.time_slot_index}
                            onValueChange={(value) => manualForm.setData("time_slot_index", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Time Slots</SelectLabel>
                                {timeSlots.map((slot, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {manualForm.errors.time_slot_index && (
                            <p className="text-destructive text-sm mt-1">{manualForm.errors.time_slot_index}</p>
                          )}
                        </div>
                      </div>
                      
                      {conflictsFromFlash && conflictsFromFlash.length > 0 && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Scheduling Conflict</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc pl-4 mt-2 space-y-1">
                              {conflictsFromFlash.map((conflict, index) => (
                                <li key={index}>
                                  {conflict.message} - {conflict.details.course} by {conflict.details.teacher} at {conflict.details.time}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isManualScheduling}>
                          {isManualScheduling ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Scheduling...
                            </>
                          ) : (
                            "Schedule Manually"
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 