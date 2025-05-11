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
import { ChevronLeft, FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface CreateProps extends PageProps {
  courses: { id: number; title: string }[];
  students: { id: number; name: string; email: string }[];
}

// Create a schema for form validation
const FormSchema = z.object({
  course_id: z.string().min(1, "Course is required"),
  student_id: z.string().min(1, "Student is required"),
  completion_date: z.string().min(1, "Completion date is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function Create({ auth, courses, students }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      course_id: "",
      student_id: "",
      completion_date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    router.post(
      route("admin.all.certificates.store"),
      data,
      {
        onSuccess: () => {
          toast.success("Certificate created successfully");
          router.visit(route("admin.all.certificates.index"));
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
          
          toast.error("Failed to create certificate");
        },
      }
    );
  };

  // Filter students by selected course
  const selectedCourseId = form.watch("course_id");
  
  // In a real app, this would filter students enrolled in the selected course
  // For now, we'll just use all students
  const filteredStudents = students;

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Create Certificate" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route("admin.all.certificates.index")}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Certificates
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Certificate</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue New Certificate</CardTitle>
            <CardDescription>
              Create a certificate for a student who has completed a course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting || !selectedCourseId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCourseId ? "Select a student" : "Select a course first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredStudents.map((student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name} ({student.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="completion_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          The date when the student completed the course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium">Certificate Template</p>
                    <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileUp className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Default Certificate Template</p>
                          <p className="text-sm text-gray-500">All certificates use the default professional template</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information to include on the certificate"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Link href={route("admin.all.certificates.index")}>
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    Create Certificate
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