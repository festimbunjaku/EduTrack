import { Head, Link, router } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, FileUp, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateProps extends PageProps {
  courses: { id: number; title: string }[];
}

// Create a schema for form validation
const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  course_id: z.string().min(1, "Course is required"),
  deadline: z.date({ required_error: "Deadline is required" }),
  max_score: z.string().min(1, "Maximum score is required"),
  attachment: z.any().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function Create({ auth, courses }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      course_id: "",
      max_score: "100",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("attachment", file);
    }
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("course_id", data.course_id);
    formData.append("deadline", data.deadline.toISOString());
    formData.append("max_score", data.max_score);
    
    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    router.post(
      route("admin.all.homework.store"),
      formData,
      {
        onSuccess: () => {
          toast.success("Homework added successfully");
          router.visit(route("admin.all.homework.index"));
        },
        onError: (errors) => {
          console.error(errors);
          setIsSubmitting(false);
          
          // Map backend errors to form errors
          Object.keys(errors).forEach((key) => {
            form.setError(key as any, {
              type: "server",
              message: errors[key],
            });
          });
          
          toast.error("Failed to add homework");
        },
      }
    );
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Create Homework Assignment" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route("admin.all.homework.index")}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Homework
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Homework Assignment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Homework Assignment</CardTitle>
            <CardDescription>
              Create a new homework assignment for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Week 1 Assignment"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="course_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide instructions, requirements, and any other details"
                          className="min-h-[150px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline <span className="text-red-500">*</span></FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select deadline date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Students must submit by this date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Score <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="1000"
                            placeholder="e.g., 100"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum points possible for this assignment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormItem>
                  <FormLabel>Attachment</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/25 transition-colors cursor-pointer relative",
                        selectedFile ? "border-green-500 bg-green-50" : "border-muted-foreground/25"
                      )}
                    >
                      <Input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        {selectedFile ? (
                          <>
                            <p className="font-medium">Selected: {selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">
                              Attach instructions, templates or reference files (optional)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, ZIP, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(route("admin.all.homework.index"))}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Assignment"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 