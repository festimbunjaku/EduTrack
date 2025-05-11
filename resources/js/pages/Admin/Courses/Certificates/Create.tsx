import { Head, Link, router } from "@inertiajs/react";
import { useForm as useReactHookForm } from "react-hook-form";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, User } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  Upload, 
  Award, 
  UserCircle 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreateProps extends PageProps {
  course: Course;
  eligibleStudents: User[];
}

interface FormData {
  user_id: string;
  signature: File | null;
}

export default function Create({ auth, course, eligibleStudents }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useReactHookForm<FormData>({
    defaultValues: {
      user_id: "",
      signature: null,
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Format the data for submission
    const formData = new FormData();
    formData.append("user_id", data.user_id);
    
    if (selectedFile) {
      formData.append("signature", selectedFile);
    }

    router.post(
      route("admin.courses.certificates.store", course.id),
      formData,
      {
        onSuccess: () => {
          toast.success("Certificate created successfully");
          router.visit(route("admin.courses.certificates.index", course.id));
        },
        onError: (errors) => {
          setIsSubmitting(false);
          toast.error("Failed to create certificate");
          console.error(errors);
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      form.setValue("signature", e.target.files[0]);
    }
  };

  // Check if course is completed (required for issuing certificates)
  const isCourseCompleted = course.status === "completed";
  
  // Check if there are eligible students
  const hasEligibleStudents = eligibleStudents.length > 0;

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Issue Certificate - ${course.title}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.certificates.index", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Certificates
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Issue Certificate</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Issue Course Completion Certificate
            </CardTitle>
            <CardDescription>
              Create a certificate for a student who has completed {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isCourseCompleted && (
              <Alert className="mb-6 bg-amber-50 text-amber-700 border-amber-200">
                <AlertTitle className="text-amber-700">Course Not Completed</AlertTitle>
                <AlertDescription>
                  Certificates can only be issued for completed courses. 
                  This course is currently marked as "{course.status}".
                </AlertDescription>
              </Alert>
            )}
            
            {isCourseCompleted && !hasEligibleStudents && (
              <Alert className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                <AlertTitle className="text-blue-700">No Eligible Students</AlertTitle>
                <AlertDescription>
                  All students who completed this course already have certificates, 
                  or there are no approved enrollments.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select
                        disabled={!isCourseCompleted || !hasEligibleStudents || isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eligibleStudents.map((student) => (
                            <SelectItem key={student.id} value={String(student.id)}>
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-blue-500" />
                                {student.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a student who has successfully completed the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Teacher Signature (Optional)</FormLabel>
                  <FormControl>
                    <div className="grid w-full items-center gap-1.5">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="signature"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                            selectedFile ? "border-green-300" : "border-gray-300",
                            (!isCourseCompleted || !hasEligibleStudents) && "opacity-50 cursor-not-allowed"
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
                                  <span className="font-semibold">Upload signature</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, or GIF (max 2MB)
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            id="signature"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={!isCourseCompleted || !hasEligibleStudents || isSubmitting}
                          />
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an image of your signature to be included on the certificate
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <div className="flex justify-end gap-4">
                  <Link href={route("admin.courses.certificates.index", course.id)}>
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={!isCourseCompleted || !hasEligibleStudents || isSubmitting || !form.watch("user_id")}
                  >
                    {isSubmitting ? "Creating..." : "Create Certificate"}
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