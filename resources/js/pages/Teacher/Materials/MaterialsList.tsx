import { Link, Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
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
import { BookIcon, FileTextIcon, LinkIcon } from 'lucide-react';

interface Props {
  materials: (CourseMaterial & {
    course: Course;
  })[];
}

export default function MaterialsList({ materials }: PageProps<Props>) {
  // Function to get icon based on material type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileTextIcon className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <BookIcon className="h-4 w-4 text-purple-500" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-green-500" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-gray-500" />;
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
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const handleDelete = (materialId: number) => {
    router.delete(route('teacher.materials.destroy', materialId));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Materials', href: '#' }
      ]}
    >
      <Head title="All Course Materials" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">All Course Materials</CardTitle>
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
                          <div className="flex items-center">
                            <span className="mr-2">{getTypeIcon(material.type)}</span>
                            {material.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={route('teacher.courses.show', material.course.id)} className="text-blue-600 hover:underline">
                            {material.course.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(material.type)}
                        </TableCell>
                        <TableCell>{format(new Date(material.created_at), 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={route('teacher.materials.show', material.id)}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={route('teacher.materials.edit', material.id)}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(material.id)}
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
    </AppLayout>
  );
} 