import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookIcon, 
  FileIcon, 
  LinkIcon, 
  PlusIcon, 
  SearchIcon,
  CalendarIcon,
  ArrowLeftIcon
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  file_path?: string;
  url?: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
}

interface IndexProps extends PageProps {
  course: Course;
  materials: Material[];
}

export default function Index({ auth, course, materials }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to get material type icon
  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <BookIcon className="h-5 w-5 text-purple-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get material type label
  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return 'Document';
      case 'video':
        return 'Video';
      case 'link':
        return 'Link';
      default:
        return 'Unknown';
    }
  };

  // Filter materials based on search term
  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout user={auth.user}>
      <Head title={`${course.title} - Materials`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={route('teacher.courses.show', course.id)}>
                    <Button variant="outline" size="sm" className="mr-4">
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back to Course
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold text-gray-800">{course.title} - Materials</h1>
                </div>
                
                <Link href={route('teacher.courses.materials.create', course.id)}>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Material
                  </Button>
                </Link>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search materials..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12">
                  {materials.length === 0 ? (
                    <div>
                      <p className="text-gray-500 text-lg mb-4">
                        No materials added to this course yet.
                      </p>
                      <Link href={route('teacher.courses.materials.create', course.id)}>
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Your First Material
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-lg">
                      No materials match your search.
                    </p>
                  )}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Materials</CardTitle>
                    <CardDescription>
                      {filteredMaterials.length} material{filteredMaterials.length !== 1 && 's'} available for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Added On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMaterials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {getMaterialTypeIcon(material.type)}
                                <span className="ml-2">{getMaterialTypeLabel(material.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{material.title}</TableCell>
                            <TableCell className="line-clamp-1">{material.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {formatDate(material.created_at)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Link href={route('teacher.courses.materials.show', [course.id, material.id])}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                              <Link href={route('teacher.courses.materials.edit', [course.id, material.id])}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 