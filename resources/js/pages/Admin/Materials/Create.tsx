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
  materialTypes: Record<string, string>;
  courses: { id: number; title: string }[];
}

// Create a schema for form validation
const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Material type is required"),
  course_id: z.string().min(1, "Course is required"),
  // These fields will be handled manually since they're conditionally required
  link_url: z.string().optional(),
  material_file: z.any().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function Create({ auth, materialTypes, courses }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      course_id: "",
      link_url: "",
    },
  });

  const materialType = form.watch("type");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("material_file", file);
    }
  };

  const onSubmit = (data: FormData) => {
    // Form validation for conditional fields
    if (data.type === "link" && !data.link_url) {
      form.setError("link_url", { 
        type: "required", 
        message: "URL is required for link type materials" 
      });
      return;
    }

    if (data.type !== "link" && !selectedFile) {
      toast.error("Please upload a file for this material type");
      return;
    }

    setIsSubmitting(true);
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("course_id", data.course_id);
    formData.append("description", data.description || "");
    
    if (data.type === "link") {
      formData.append("link_url", data.link_url || "");
    } else if (selectedFile) {
      formData.append("material_file", selectedFile);
    }

    router.post(
      route("admin.all.materials.store"),
      formData,
      {
        onSuccess: () => {
          toast.success("Material added successfully");
          router.visit(route("admin.all.materials.index"));
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
          
          toast.error("Failed to add material");
        },
      }
    );
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Add Course Material" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route("admin.all.materials.index")}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Materials
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add Course Material</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Material</CardTitle>
            <CardDescription>
              Add educational materials like documents, videos, images, or links
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
                            placeholder="e.g., Week 1 Lecture Notes"
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Type <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(materialTypes).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a brief description of this material"
                          className="min-h-[120px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {materialType === "link" ? (
                  <FormField
                    control={form.control}
                    name="link_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com/resource"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the full URL for this resource
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormItem>
                    <FormLabel>Upload File <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                          selectedFile ? "bg-green-50 border-green-300" : "border-gray-300 hover:border-blue-400"
                        )}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <FileUp className={cn(
                          "h-8 w-8 mx-auto mb-2",
                          selectedFile ? "text-green-500" : "text-gray-400"
                        )} />
                        {selectedFile ? (
                          <>
                            <p className="text-sm font-medium text-green-600">File selected</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">Support for documents, videos, images, and audio files</p>
                          </>
                        )}
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting ? "Uploading..." : "Upload Material"}
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