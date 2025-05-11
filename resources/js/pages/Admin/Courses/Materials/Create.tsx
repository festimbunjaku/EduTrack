import { Head, Link, router } from "@inertiajs/react";
import { useForm as useReactHookForm } from "react-hook-form";
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
  course: Course;
  materialTypes: Record<string, string>;
}

// Create a schema for form validation
const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Material type is required"),
  // These fields will be handled manually since they're conditionally required
  link_url: z.string().optional(),
  material_file: z.any().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function Create({ auth, course, materialTypes }: CreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useReactHookForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
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
    formData.append("description", data.description || "");
    
    if (data.type === "link") {
      formData.append("link_url", data.link_url || "");
    } else if (selectedFile) {
      formData.append("material_file", selectedFile);
    }

    router.post(
      route("admin.courses.materials.store", course.id),
      formData,
      {
        onSuccess: () => {
          toast.success("Material added successfully");
          router.visit(route("admin.courses.materials.index", course.id));
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
          <Link href={route("admin.courses.materials.index", course.id)}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Materials
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add Course Material</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Material for {course.title}</CardTitle>
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
                </div>

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
                                PDFs, documents, images, videos, and audio files are supported
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(route("admin.courses.materials.index", course.id))}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading..." : "Add Material"}
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