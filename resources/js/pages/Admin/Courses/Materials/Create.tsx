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
                    <FormLabel>Upload File {materialType && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="material_file"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                            selectedFile ? "border-green-300" : "border-gray-300",
                            !materialType && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className={cn(
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
                            id="material_file"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isSubmitting || !materialType || materialType === "link"}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload the file for this material
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Link href={route("admin.courses.materials.index", course.id)}>
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !form.formState.isValid}
                  >
                    {isSubmitting ? "Adding..." : "Add Material"}
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