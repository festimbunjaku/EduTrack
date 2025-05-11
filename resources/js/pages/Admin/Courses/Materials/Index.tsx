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
  CardFooter,
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
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";

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

  // Function to get appropriate icon for material type (larger size)
  const getLargeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-12 w-12 text-blue-500" />;
      case "video":
        return <Film className="h-12 w-12 text-red-500" />;
      case "image":
        return <ImageIcon className="h-12 w-12 text-green-500" />;
      case "link":
        return <LinkIcon className="h-12 w-12 text-purple-500" />;
      case "audio":
        return <Headphones className="h-12 w-12 text-yellow-500" />;
      default:
        return <FileQuestion className="h-12 w-12 text-gray-500" />;
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

  // Material card component
  const MaterialCard = ({ material }: { material: CourseMaterial }) => (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="capitalize">
            {materialTypes[material.type]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(material.created_at), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex justify-center py-4">
          {getLargeIcon(material.type)}
        </div>
        <CardTitle className="text-center mb-1 truncate">{material.title}</CardTitle>
        {material.description && (
          <CardDescription className="text-center text-sm line-clamp-2">
            {material.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {material.file_size && (
          <div className="text-sm text-center text-muted-foreground mt-2">
            {formatBytes(material.file_size)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-0">
        <Link
          href={route("admin.courses.materials.show", {
            course: course.id,
            material: material.id,
          })}
        >
          <Button size="sm" variant="ghost" title="View material">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
        <Link
          href={route("admin.courses.materials.edit", {
            course: course.id,
            material: material.id,
          })}
        >
          <Button size="sm" variant="ghost" title="Edit material">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        {material.type !== "link" ? (
          <Link
            href={route("admin.courses.materials.download", {
              course: course.id,
              material: material.id,
            })}
          >
            <Button size="sm" variant="ghost" title="Download material">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </Link>
        ) : (
          <a
            href={material.file_path || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="ghost" title="Open link">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </a>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setMaterialToDelete(material)}
          title="Delete material"
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Course Materials - ${course.title}`} />

      <Dialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the material{" "}
              <span className="font-semibold">{materialToDelete?.title}</span>?
              This action cannot be undone.
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route("admin.courses.show", course.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
            <PageHeader
              heading="Course Materials"
              subheading={course.title}
            />
          </div>
          <Link href={route("admin.courses.materials.create", course.id)}>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="py-2">
            {materials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileQuestion className="h-16 w-16 text-gray-400" />
                  <h3 className="text-xl font-semibold mt-4">No Materials Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    This course doesn't have any learning materials yet. Add your first
                    lecture notes, slides, or other resources for your students.
                  </p>
                  <Link href={route("admin.courses.materials.create", course.id)}>
                    <Button className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add First Material
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table" className="py-2">
            <Card>
              {materials.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Added on</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getMaterialIcon(material.type)}
                            <span className="truncate max-w-[200px]">
                              {material.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {materialTypes[material.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {material.file_size
                            ? formatBytes(material.file_size)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(material.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={route("admin.courses.materials.show", {
                                course: course.id,
                                material: material.id,
                              })}
                            >
                              <Button size="sm" variant="ghost" title="View material">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={route("admin.courses.materials.edit", {
                                course: course.id,
                                material: material.id,
                              })}
                            >
                              <Button size="sm" variant="ghost" title="Edit material">
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
                                <Button size="sm" variant="ghost" title="Download material">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </Link>
                            ) : (
                              <a
                                href={material.file_path || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="ghost" title="Open link">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setMaterialToDelete(material)}
                              title="Delete material"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileQuestion className="h-16 w-16 text-gray-400" />
                    <h3 className="text-xl font-semibold mt-4">No Materials Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      This course doesn't have any learning materials yet. Add your first
                      lecture notes, slides, or other resources for your students.
                    </p>
                    <Link href={route("admin.courses.materials.create", course.id)}>
                      <Button className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add First Material
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppSidebarLayout>
  );
} 