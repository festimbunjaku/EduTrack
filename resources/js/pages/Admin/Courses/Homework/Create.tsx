import { Head, Link, router, useForm } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateProps extends PageProps {
  course: Course;
}

export default function Create({ auth, course }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    title: "",
    description: "",
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
    attachment: null as File | null,
  });

  const onSubmit = (data: typeof form.data) => {
    setIsSubmitting(true);
    
    // Format the data for submission
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("deadline", format(data.deadline, "yyyy-MM-dd HH:mm:ss"));
    
    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    router.post(
      route("admin.courses.homework.store", course.id),
      formData,
      {
        onSuccess: () => {
          toast.success("Homework created successfully");
          router.visit(route("admin.courses.homework.index", course.id));
        },
        onError: (errors) => {
          setIsSubmitting(false);
          toast.error("Failed to create homework");
          console.error(errors);
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Update form.data for validation purposes
      form.setData("attachment", e.target.files[0]);
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Add Homework - ${course.title}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.homework.index", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Homework List
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Add Homework</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Homework Assignment</CardTitle>
            <CardDescription>
              Add a new homework assignment for students in {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter homework title"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive title for the homework assignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed instructions for the homework"
                          className="min-h-32"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide clear instructions, requirements, and any resources needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Submission Deadline</FormLabel>
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
                                <span>Pick a date</span>
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
                        Set the date when students must submit their work
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <FormControl>
                    <div className="grid w-full items-center gap-1.5">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="attachment"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                            selectedFile ? "border-green-300" : "border-gray-300"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={cn(
                              "w-8 h-8 mb-2",
                              selectedFile ? "text-green-500" : "text-gray-500"
                            )} />
                            {selectedFile ? (
                              <div className="text-center">
                                <p className="mb-2 text-sm text-green-700 font-semibold">
                                  {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  Any file up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            id="attachment"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload any supporting files, documents, or resources for the homework
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <div className="flex justify-end gap-4">
                  <Link href={route("admin.courses.homework.index", course.id)}>
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Homework"}
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