import { Head, Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, CourseMaterial } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  File,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Headphones,
  FileQuestion,
  ChevronLeft,
  Download,
  ExternalLink,
  Calendar,
  Edit,
  Upload,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { formatBytes } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShowProps extends PageProps {
  course: Course;
  material: CourseMaterial;
  materialTypes: Record<string, string>;
}

export default function Show({ auth, course, material, materialTypes }: ShowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Function to get appropriate icon for material type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-5 w-5" />;
      case "video":
        return <Film className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      case "audio":
        return <Headphones className="h-5 w-5" />;
      default:
        return <FileQuestion className="h-5 w-5" />;
    }
  };

  // Function to handle material deletion
  const handleDelete = () => {
    window.location.href = route("admin.courses.materials.destroy", {
      course: course.id,
      material: material.id,
    });
  };

  // Function to determine if the material can be previewed
  const canPreview = () => {
    if (material.type === "image") {
      return true;
    }
    if (material.type === "video" && material.file_extension && 
        ["mp4", "webm", "ogg"].includes(material.file_extension)) {
      return true;
    }
    if (material.type === "audio" && material.file_extension && 
        ["mp3", "wav", "ogg"].includes(material.file_extension)) {
      return true;
    }
    return false;
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Material: ${material.title}`} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{material.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.materials.index", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Materials
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Material Details</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={route("admin.courses.materials.edit", {
                course: course.id,
                material: material.id,
              })}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Material
              </Button>
            </Link>
            {material.type !== "link" ? (
              <Link
                href={route("admin.courses.materials.download", {
                  course: course.id,
                  material: material.id,
                })}
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </Link>
            ) : (
              <a
                href={material.file_path || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </Button>
              </a>
            )}
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getMaterialIcon(material.type)}
                  <div>
                    <CardTitle>{material.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {materialTypes[material.type]}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {material.description ? (
                  <div className="prose max-w-none">
                    <p>{material.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </CardContent>
            </Card>

            {canPreview() && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {material.type === "image" && material.file_path && (
                    <div className="rounded-md overflow-hidden border max-w-2xl mx-auto">
                      <img 
                        src={route("admin.courses.materials.download", {
                          course: course.id,
                          material: material.id,
                        })} 
                        alt={material.title} 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  {material.type === "video" && material.file_path && (
                    <div className="rounded-md overflow-hidden border max-w-2xl mx-auto">
                      <video 
                        controls 
                        className="w-full h-auto"
                      >
                        <source 
                          src={route("admin.courses.materials.download", {
                            course: course.id,
                            material: material.id,
                          })} 
                          type={`video/${material.file_extension}`} 
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {material.type === "audio" && material.file_path && (
                    <div className="rounded-md border p-4 max-w-2xl mx-auto">
                      <audio 
                        controls 
                        className="w-full"
                      >
                        <source 
                          src={route("admin.courses.materials.download", {
                            course: course.id,
                            material: material.id,
                          })} 
                          type={`audio/${material.file_extension}`} 
                        />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course</h3>
                  <p className="mt-1">
                    <Link 
                      href={route("admin.courses.show", course.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {course.title}
                    </Link>
                  </p>
                </div>

                {material.type !== "link" && material.file_name && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Name</h3>
                    <p className="mt-1">{material.file_name}</p>
                  </div>
                )}

                {material.type === "link" && material.file_path && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">URL</h3>
                    <p className="mt-1 break-all">
                      <a 
                        href={material.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {material.file_path}
                      </a>
                    </p>
                  </div>
                )}

                {material.type !== "link" && material.file_size !== null && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Size</h3>
                    <p className="mt-1">{formatBytes(material.file_size)}</p>
                  </div>
                )}

                {material.type !== "link" && material.file_extension && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Type</h3>
                    <p className="mt-1 uppercase">{material.file_extension}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Added On</h3>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {format(new Date(material.created_at), "MMMM d, yyyy")}
                  </p>
                </div>

                {material.created_at !== material.updated_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {format(new Date(material.updated_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 