import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileIcon, FolderIcon, LinkIcon, PlusIcon, SearchIcon, VideoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CourseMaterial, Course } from '@/types';
import { BookOpenIcon, FileTextIcon } from 'lucide-react';

interface Material {
  id: number;
  course_id: number;
  title: string;
  description: string;
  type: string;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_extension: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
  materials: Material[];
}

interface AllMaterialsProps extends PageProps {
  courses: Course[];
  materials: (CourseMaterial & {
    course: Course;
  })[];
}

export default function AllMaterials({ courses = [], materials = [] }: AllMaterialsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter materials based on search query
  const filteredCourses = (courses || []).map(course => ({
    ...course,
    materials: course.materials.filter(material => 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.materials.length > 0);
  
  // Count total materials
  const totalMaterials = (courses || []).reduce((acc, course) => acc + course.materials.length, 0);
  
  // Get all material types
  const materialTypes = [...new Set((courses || []).flatMap(course => 
    course.materials.map(material => material.type)
  ))];
  
  // Function to get icon based on material type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileTextIcon className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <BookOpenIcon className="h-4 w-4 text-purple-500" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-green-500" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Materials', href: '#' }
      ]}
    >
      <Head title="Course Materials" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Course Materials</h1>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search materials..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Materials ({totalMaterials})</TabsTrigger>
              {materialTypes.map(type => (
                <TabsTrigger key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              {filteredCourses.length > 0 ? (
                <div className="space-y-8">
                  {filteredCourses.map(course => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <Link href={route('teacher.courses.show', course.id)}>
                            {course.title}
                          </Link>
                          <Link href={route('teacher.courses.materials.create', course.id)}>
                            <Button size="sm">
                              <PlusIcon className="h-4 w-4 mr-2" /> 
                              Add Material
                            </Button>
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {course.materials.length} material{course.materials.length !== 1 && 's'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {course.materials.map(material => (
                            <Link 
                              key={material.id}
                              href={route('teacher.courses.materials.show', [course.id, material.id])}
                            >
                              <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      {getTypeBadge(material.type)}
                                      <h3 className="text-base font-medium mt-2">{material.title}</h3>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                  <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                                </CardContent>
                                <CardFooter className="pt-2 text-xs text-gray-500 flex items-center">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {formatDate(material.created_at)}
                                </CardFooter>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FolderIcon className="h-8 w-8 text-gray-500" />
                    </div>
                    {searchQuery ? (
                      <>
                        <h2 className="text-xl font-semibold mb-2">No materials found</h2>
                        <p className="text-gray-500 mb-6">
                          No materials match your search query "{searchQuery}".
                        </p>
                        <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold mb-2">No materials yet</h2>
                        <p className="text-gray-500 mb-6">
                          You haven't created any course materials yet. Add materials to your courses to get started.
                        </p>
                        {courses && courses.length > 0 && (
                          <Link href={route('teacher.courses.materials.create', courses[0].id)}>
                            <Button>Create Material</Button>
                          </Link>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {materialTypes.map(type => (
              <TabsContent key={type} value={type}>
                <div className="space-y-8">
                  {filteredCourses
                    .map(course => ({
                      ...course,
                      materials: course.materials.filter(m => m.type === type)
                    }))
                    .filter(course => course.materials.length > 0)
                    .map(course => (
                      <Card key={course.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <Link href={route('teacher.courses.show', course.id)}>
                              {course.title}
                            </Link>
                            <Link href={route('teacher.courses.materials.create', course.id)}>
                              <Button size="sm">
                                <PlusIcon className="h-4 w-4 mr-2" /> 
                                Add Material
                              </Button>
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            {course.materials.length} {type}{course.materials.length !== 1 && 's'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {course.materials.map(material => (
                              <Link 
                                key={material.id}
                                href={route('teacher.courses.materials.show', [course.id, material.id])}
                              >
                                <Card className="h-full hover:shadow-md transition-shadow">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        {getTypeBadge(material.type)}
                                        <h3 className="text-base font-medium mt-2">{material.title}</h3>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-2">
                                    <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                                  </CardContent>
                                  <CardFooter className="pt-2 text-xs text-gray-500 flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {formatDate(material.created_at)}
                                  </CardFooter>
                                </Card>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
} 