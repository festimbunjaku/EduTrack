import { Head, Link, useForm } from "@inertiajs/react";
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

interface CreateProps extends PageProps {
  course: Course;
  materialTypes: Record<string, string>;
}

export default function Create({ auth, course, materialTypes }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    description: "",
    type: "",
    material_file: null as File | null,
    link_url: "",
  });
  
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData("material_file", file);
      setFileDetails({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route("admin.courses.materials.store", course.id), {
      forceFormData: true,
    });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    placeholder="e.g., Week 1 Lecture Notes"
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Material Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={data.type}
                    onValueChange={(value) => setData("type", value)}
                    required
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
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  placeholder="Provide a brief description of this material"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {data.type !== "link" ? (
                <div className="space-y-2">
                  <label htmlFor="material_file" className="text-sm font-medium">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="material_file"
                      type="file"
                      onChange={handleFileChange}
                      className="max-w-md"
                      required={data.type !== "link"}
                    />
                  </div>
                  {fileDetails && (
                    <p className="text-sm text-gray-500">
                      Selected: {fileDetails.name} ({(fileDetails.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {errors.material_file && (
                    <p className="text-sm text-red-500">{errors.material_file}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="link_url" className="text-sm font-medium">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="link_url"
                    type="url"
                    value={data.link_url}
                    onChange={(e) => setData("link_url", e.target.value)}
                    placeholder="https://example.com/resource"
                    required={data.type === "link"}
                  />
                  {errors.link_url && (
                    <p className="text-sm text-red-500">{errors.link_url}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Link href={route("admin.courses.materials.index", course.id)}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? "Uploading..." : "Add Material"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 