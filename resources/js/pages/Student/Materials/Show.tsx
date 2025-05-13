import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
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
  ArrowLeftIcon,
  BookOpenIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilmIcon,
  LinkIcon,
  PlayIcon,
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  image: string | null;
  teacher: {
    id: number;
    name: string;
  };
}

interface Material {
  id: number;
  title: string;
  description: string;
  content: string | null;
  type: 'document' | 'video' | 'link' | string;
  file_path: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
  course_id: number;
}

interface ShowProps extends PageProps {
  course: Course;
  material: Material;
  related_materials: Material[];
}

export default function Show({ auth, course, material, related_materials }: ShowProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get icon based on material type
  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <FileTextIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <FilmIcon className="h-5 w-5 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FileTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render content based on material type
  const renderContent = () => {
    switch (material.type.toLowerCase()) {
      case 'document':
        if (material.content) {
          return (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: material.content }} />
          );
        } else if (material.file_path) {
          return (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
              <FileTextIcon className="h-16 w-16 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-4">Document File Available</h3>
              <a href={`/student/materials/${material.id}/download`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download Document
              </a>
            </div>
          );
        }
        break;
      
      case 'video':
        if (material.url) {
          // Check if it's a YouTube URL
          if (material.url.includes('youtube.com') || material.url.includes('youtu.be')) {
            const videoId = material.url.includes('youtu.be') 
              ? material.url.split('/').pop() 
              : new URL(material.url).searchParams.get('v');
            
            return (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            );
          } else {
            // Other video URL
            return (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
                <video controls className="w-full h-full">
                  <source src={material.url} />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }
        } else if (material.file_path) {
          return (
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
              <video controls className="w-full h-full">
                <source src={`/storage/${material.file_path}`} />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        break;
      
      case 'link':
        return (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
            <LinkIcon className="h-16 w-16 text-purple-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">{material.title}</h3>
            <p className="text-gray-500 mb-4">{material.description}</p>
            <a 
              href={material.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Visit Link
            </a>
          </div>
        );
      
      default:
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: material.content || material.description }} />
        );
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title={material.title} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Link href={route('student.materials.index')}>
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Materials
                </Button>
              </Link>
              <Link href={route('student.courses.show', course.id)}>
                <Button variant="outline" size="sm">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  View Course
                </Button>
              </Link>
            </div>
            
            {material.file_path && (
              <a href={`/student/materials/${material.id}/download`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </a>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {getMaterialIcon(material.type)}
                    <span className="text-sm font-medium ml-2 text-gray-500 capitalize">
                      {material.type}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{material.title}</CardTitle>
                  <CardDescription>
                    {course.title} • Added on {formatDate(material.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-gray-700">{material.description}</p>
                  </div>
                  
                  <div className="mt-6">
                    {renderContent()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 overflow-hidden">
                      {course.image ? (
                        <img 
                          src={`/storage/${course.image}`} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpenIcon className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        <Link
                          href={route('student.courses.show', course.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {course.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        Instructor: {course.teacher?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50">
                  <div className="w-full">
                    <Link href={route('student.courses.show', course.id)}>
                      <Button variant="outline" className="w-full">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
              
              {related_materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Materials</CardTitle>
                    <CardDescription>
                      Other materials from this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {related_materials.map((related) => (
                        <Link 
                          key={related.id}
                          href={route('student.materials.show', related.id)}
                          className="block hover:bg-gray-50"
                        >
                          <div className="p-4 flex items-start">
                            <div className="mr-3 mt-0.5">
                              {getMaterialIcon(related.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-600 hover:text-blue-800">
                                {related.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(related.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50">
                    <div className="w-full">
                      <Link href={route('student.courses.show', course.id) + '?tab=materials'}>
                        <Button variant="outline" className="w-full text-sm">
                          View All Course Materials
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 