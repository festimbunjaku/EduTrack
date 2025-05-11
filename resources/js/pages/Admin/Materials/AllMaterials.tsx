import { Link, Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CourseMaterial, Course } from '@/types';
import { FileTextIcon, VideoIcon, LinkIcon, ImageIcon, MusicIcon, FileIcon } from 'lucide-react';

interface Props {
  materials: (CourseMaterial & {
    course: Course;
  })[];
}

export default function AllMaterials({ auth, materials }: PageProps<Props>) {
  // Function to get icon based on material type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileTextIcon className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <VideoIcon className="h-4 w-4 text-purple-500" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-green-500" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-amber-500" />;
      case 'audio':
        return <MusicIcon className="h-4 w-4 text-red-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Function to get badge based on material type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'document':
        return <Badge className="bg-blue-100 text-blue-800">Document</Badge>;
      case 'video':
        return <Badge className="bg-purple-100 text-purple-800">Video</Badge>;
      case 'link':
        return <Badge className="bg-green-100 text-green-800">Link</Badge>;
      case 'image':
        return <Badge className="bg-amber-100 text-amber-800">Image</Badge>;
      case 'audio':
        return <Badge className="bg-red-100 text-red-800">Audio</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Other</Badge>;
    }
  };

  // Function to handle delete
  const handleDelete = (courseId: number, materialId: number) => {
    if (confirm('Are you sure you want to delete this material?')) {
      router.delete(route('admin.all.materials.destroy', materialId));
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="All Course Materials" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">All Course Materials</CardTitle>
              <Link href={route('admin.all.materials.create')}>
                <Button>
                  Create Material
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No materials available.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(material.type)}
                            {material.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={route('admin.courses.show', material.course.id)} className="text-blue-600 hover:underline">
                            {material.course.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(material.type)}
                        </TableCell>
                        <TableCell>{format(new Date(material.created_at), 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('admin.all.materials.show', material.id)}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link href={route('admin.all.materials.edit', material.id)}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(material.course.id, material.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 