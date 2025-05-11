import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  BookIcon, 
  FileIcon, 
  LinkIcon, 
  CalendarIcon, 
  ArrowLeftIcon, 
  ExternalLinkIcon, 
  Edit3Icon, 
  Trash2Icon
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  file_path?: string;
  url?: string;
  created_at: string;
}

interface ShowProps extends PageProps {
  course: Course;
  material: Material;
}

export default function Show({ auth, course, material }: ShowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        return <FileIcon className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <BookIcon className="h-6 w-6 text-purple-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-green-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
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

  // Function to handle material deletion
  const handleDelete = () => {
    router.delete(route('teacher.courses.materials.destroy', [course.id, material.id]), {
      onSuccess: () => {
        // This will redirect to the materials index page
      },
    });
  };

  return (
    <AppLayout user={auth.user}>
      <Head title={`${material.title} - Material`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Link href={route('teacher.courses.materials.index', course.id)}>
                    <Button variant="outline" size="sm" className="mr-4">
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back to Materials
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-semibold text-gray-800">{material.title}</h1>
                </div>
                
                <div className="flex space-x-2">
                  <Link href={route('teacher.courses.materials.edit', [course.id, material.id])}>
                    <Button variant="outline">
                      <Edit3Icon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>

                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-gray-100 rounded-full">
                      {getMaterialTypeIcon(material.type)}
                    </div>
                    <div>
                      <CardTitle>{material.title}</CardTitle>
                      <CardDescription>
                        {getMaterialTypeLabel(material.type)} · Added on {formatDate(material.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none mb-6">
                    <p>{material.description}</p>
                  </div>

                  {material.type === 'link' && material.url && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-blue-600 truncate max-w-md">{material.url}</span>
                        </div>
                        <a 
                          href={material.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center px-3 py-2 bg-white border border-blue-300 rounded-md font-semibold text-xs text-blue-700 uppercase tracking-widest shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Visit Link
                        </a>
                      </div>
                    </div>
                  )}

                  {(material.type === 'document' || material.type === 'video') && material.file_path && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {material.type === 'document' ? (
                            <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                          ) : (
                            <BookIcon className="h-5 w-5 text-purple-500 mr-2" />
                          )}
                          <span className="truncate max-w-md">
                            {material.file_path.split('/').pop()}
                          </span>
                        </div>
                        <a 
                          href={`/storage/${material.file_path}`}
                          target="_blank" 
                          className="inline-flex items-center px-3 py-2 bg-white border border-blue-300 rounded-md font-semibold text-xs text-blue-700 uppercase tracking-widest shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          {material.type === 'video' ? 'Watch Video' : 'View Document'}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 p-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Course:</span> {course.title}
                  </div>
                </CardFooter>
              </Card>

              {material.type === 'video' && material.file_path && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video">
                      <video 
                        controls 
                        className="w-full h-full object-cover rounded-md"
                        src={`/storage/${material.file_path}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              {material.type === 'document' && material.file_path && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-md">
                      <a 
                        href={`/storage/${material.file_path}`}
                        target="_blank" 
                        className="flex flex-col items-center p-8"
                      >
                        <FileIcon className="h-16 w-16 text-blue-500 mb-4" />
                        <span className="text-blue-600 font-medium">
                          Click to open document
                        </span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deletion confirmation dialog */}
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this material? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 