import { Head, Link } from "@inertiajs/react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  File,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Headphones,
  FileQuestion,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/utils";

interface IndexProps extends PageProps {
  course: Course;
  materials: CourseMaterial[];
  materialTypes: Record<string, string>;
}

export default function Index({ auth, course, materials, materialTypes }: IndexProps) {
  const [materialToDelete, setMaterialToDelete] = useState<CourseMaterial | null>(null);
  
  // Function to get appropriate icon for material type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-4 w-4" />;
      case "video":
        return <Film className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      case "audio":
        return <Headphones className="h-4 w-4" />;
      default:
        return <FileQuestion className="h-4 w-4" />;
    }
  };

  // Function to handle material deletion
  const handleDelete = () => {
    if (materialToDelete) {
      window.location.href = route("admin.courses.materials.destroy", {
        course: course.id,
        material: materialToDelete.id,
      });
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Course Materials - ${course.title}`} />

      <Dialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{materialToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaterialToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.show", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Course Materials</h1>
          </div>
          <Link href={route("admin.courses.materials.create", course.id)}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Materials for {course.title}</CardTitle>
            <CardDescription>
              Manage educational materials, files, and links for this course
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getMaterialIcon(material.type)}
                            {material.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {materialTypes[material.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {material.file_size ? formatBytes(material.file_size) : "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(material.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Link
                            href={route("admin.courses.materials.show", {
                              course: course.id,
                              material: material.id,
                            })}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              title="View material"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={route("admin.courses.materials.edit", {
                              course: course.id,
                              material: material.id,
                            })}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit material"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {material.type !== "link" ? (
                            <Link
                              href={route("admin.courses.materials.download", {
                                course: course.id,
                                material: material.id,
                              })}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Download material"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <a
                              href={material.file_path || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Open link"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setMaterialToDelete(material)}
                            title="Delete material"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
                <p className="text-gray-500 mb-6">
                  Add documents, videos, links, or other materials for this course
                </p>
                <Link href={route("admin.courses.materials.create", course.id)}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Material
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 