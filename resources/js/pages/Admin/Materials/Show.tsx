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
  material: CourseMaterial;
  course: Course;
}

export default function Show({ auth, material, course }: ShowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Define material types
  const materialTypes = {
    'document': 'Document',
    'video': 'Video',
    'link': 'External Link',
    'image': 'Image',
    'audio': 'Audio',
    'other': 'Other',
  };
  
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
    window.location.href = route("admin.all.materials.destroy", material.id);
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
            <Link href={route("admin.all.materials.index")}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to All Materials
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Material Details</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={route("admin.all.materials.edit", material.id)}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Material
              </Button>
            </Link>
            {material.type !== "link" ? (
              <a
                href={`/admin/all/materials/${material.id}/download`}
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-25 transition"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            ) : (
              <a
                href={material.file_path || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-25 transition"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
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
                        {materialTypes[material.type as keyof typeof materialTypes]}
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
                        src={`/admin/all/materials/${material.id}/download`}
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
                          src={`/admin/all/materials/${material.id}/download`}
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
                          src={`/admin/all/materials/${material.id}/download`}
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
                  <p>
                    <Link 
                      href={route("admin.courses.show", course.id)} 
                      className="text-blue-600 hover:underline"
                    >
                      {course.title}
                    </Link>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{format(new Date(material.created_at), 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                {material.file_size > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Size</h3>
                    <p>{formatBytes(material.file_size)}</p>
                  </div>
                )}

                {material.file_extension && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">File Type</h3>
                    <p className="uppercase">{material.file_extension}</p>
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