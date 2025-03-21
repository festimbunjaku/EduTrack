import { Head, Link, router, useForm } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Homework } from "@/types";
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
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  ChevronLeft, 
  Upload, 
  File, 
  X, 
  Download 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditProps extends PageProps {
  course: Course;
  homework: Homework;
}

export default function Edit({ auth, course, homework }: EditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const initialDeadline = parse(
    homework.deadline,
    "yyyy-MM-dd HH:mm:ss",
    new Date()
  );

  const form = useForm({
    title: homework.title,
    description: homework.description || "",
    deadline: initialDeadline,
    attachment: null as File | null,
    _method: "PUT",
  });

  const onSubmit = (data: typeof form.data) => {
    setIsSubmitting(true);
    
    // Format the data for submission
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("deadline", format(data.deadline, "yyyy-MM-dd HH:mm:ss"));
    formData.append("_method", "PUT");
    
    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    router.post(
      route("admin.courses.homework.update", {
        course: course.id,
        homework: homework.id,
      }),
      formData,
      {
        onSuccess: () => {
          toast.success("Homework updated successfully");
          router.visit(route("admin.courses.homework.show", {
            course: course.id,
            homework: homework.id,
          }));
        },
        onError: (errors) => {
          setIsSubmitting(false);
          toast.error("Failed to update homework");
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

  const handleRemoveAttachment = () => {
    setSelectedFile(null);
    form.setData("attachment", null);
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Edit Homework - ${homework.title}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.homework.show", { course: course.id, homework: homework.id })}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Homework Details
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Homework</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Homework Assignment</CardTitle>
            <CardDescription>
              Update homework details for {course.title}
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
                  <FormLabel>Attachment</FormLabel>
                  <FormControl>
                    <div className="grid w-full items-center gap-1.5">
                      {homework.attachment_path && !selectedFile ? (
                        <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                          <File className="h-5 w-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">
                              {homework.attachment_path.split('/').pop()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link
                              href={route("admin.courses.homework.download", {
                                course: course.id,
                                homework: homework.id,
                              })}
                              className="shrink-0"
                            >
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                // Set a flag to remove the attachment on submit
                                form.setData("remove_attachment", true);
                                handleRemoveAttachment();
                              }}
                              type="button"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload any supporting files, documents, or resources for the homework
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <div className="flex justify-end gap-4">
                  <Link href={route("admin.courses.homework.show", { course: course.id, homework: homework.id })}>
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Homework"}
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