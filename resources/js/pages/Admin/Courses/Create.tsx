import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
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
import { PlusCircle, XCircle } from "lucide-react";

interface ScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
}

interface CreateProps extends PageProps {
  teachers: User[];
  statuses: Record<string, string>;
}

export default function Create({ auth, teachers, statuses }: CreateProps) {
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
    schedule: [] as ScheduleItem[],
    teacher_id: "",
    max_enrollment: "20",
    status: "upcoming",
  });

  // For adding schedule items
  const [newScheduleDay, setNewScheduleDay] = useState("");
  const [newScheduleStartTime, setNewScheduleStartTime] = useState("");
  const [newScheduleEndTime, setNewScheduleEndTime] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(name as any, value);
  };

  const handleAddScheduleItem = () => {
    if (newScheduleDay && newScheduleStartTime && newScheduleEndTime) {
      const newItem = {
        day: newScheduleDay,
        start_time: newScheduleStartTime,
        end_time: newScheduleEndTime
      };
      
      setData('schedule', [...data.schedule, newItem]);
      
      // Reset inputs
      setNewScheduleDay("");
      setNewScheduleStartTime("");
      setNewScheduleEndTime("");
    }
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updatedSchedule = [...data.schedule];
    updatedSchedule.splice(index, 1);
    setData('schedule', updatedSchedule);
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

                <div className="space-y-4">
                  <Label>Schedule</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="day">Day</Label>
                      <Select 
                        value={newScheduleDay} 
                        onValueChange={setNewScheduleDay}>
                        <SelectTrigger>
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
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newScheduleStartTime}
                        onChange={(e) => setNewScheduleStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newScheduleEndTime}
                        onChange={(e) => setNewScheduleEndTime(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={handleAddScheduleItem}
                        variant="outline"
                        className="w-full flex items-center"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>

                  {errors.schedule && <p className="text-sm text-red-500">{errors.schedule}</p>}

                  {data.schedule.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Schedule Items:</h3>
                      <div className="space-y-2">
                        {data.schedule.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                            <span>
                              {days.find(d => d.value === item.day)?.label}: {item.start_time} - {item.end_time}
                            </span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveScheduleItem(index)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                        {Object.entries(statuses).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 