import { Head, Link, router } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, CourseMaterial } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { formatBytes } from "@/lib/utils";

interface EditProps extends PageProps {
  material: CourseMaterial;
  course: Course;
  materialTypes: Record<string, string>;
}

export default function Edit({ auth, material, course, materialTypes }: EditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: material.title,
    description: material.description || "",
    type: material.type,
    link_url: material.type === "link" ? material.file_path || "" : "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileDetails({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create FormData object for submission
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);
    data.append("_method", "put");
    
    if (formData.type === "link") {
      data.append("link", formData.link_url);
    } else if (selectedFile) {
      data.append("file", selectedFile);
    }
    
    router.post(route("admin.all.materials.update", material.id), data, {
      forceFormData: true,
      onSuccess: () => {
        // Redirect on success
        router.visit(route("admin.all.materials.show", material.id));
      },
      onError: (errors) => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Edit Material - ${material.title}`} />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route("admin.all.materials.show", material.id)}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Material
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Material</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Material</CardTitle>
            <CardDescription>
              Update details and file for this course material
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Week 1 Lecture Notes"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Material Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(materialTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide a brief description of this material"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              {formData.type !== "link" ? (
                <div className="space-y-2">
                  <label htmlFor="material_file" className="text-sm font-medium">
                    Replace File
                  </label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="material_file"
                      type="file"
                      onChange={handleFileChange}
                      className="max-w-md"
                      disabled={isSubmitting}
                    />
                    {material.file_name && !fileDetails && (
                      <p className="text-sm text-gray-500">
                        Current file: {material.file_name} ({material.file_size ? formatBytes(material.file_size) : "Unknown size"})
                      </p>
                    )}
                    {fileDetails && (
                      <p className="text-sm text-gray-500">
                        New file: {fileDetails.name} ({(fileDetails.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="link_url" className="text-sm font-medium">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => handleInputChange("link_url", e.target.value)}
                    placeholder="https://example.com/resource"
                    required={formData.type === "link"}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Link href={route("admin.all.materials.show", material.id)}>
                  <Button variant="outline" type="button" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Material"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 